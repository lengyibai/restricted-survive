import { Assets, Container, Ticker, type Resource, type Texture } from "pixi.js";
import PF from "pathfinding";

import { FindWayMapUI } from "../FindWayMapUI";

import { _generateFrames, _SpriteAnimate, _trigger100Times } from "@/utils/pixiTool";
import { mapStore } from "@/store/map";
import { playerStore } from "@/store/player";

/** @description 玩家 */
export class PlayerUI extends Container {
  /** 当前速度，米/秒，默认为4 */
  static readonly SPEED = 10;
  /** 玩家大小 */
  static readonly SIZE = {
    width: 45 * 0.83,
    height: 60 * 0.83,
  };
  /** 按键Key与精灵动画索引映射 */
  private DIRECTIONS: Record<string, number> = {
    down: 0,
    left: 1,
    right: 3,
    up: 2,
  };
  /** 按下不同方向键时，控制玩家移动方向状态 */
  private playerMoveDirection: Record<Game.DirectionFour, boolean> = {
    left: false,
    right: false,
    up: false,
    down: false,
  };
  /** 上一次移动的方向 */
  private lastDirection: string;
  /** 计算得到的路径 */
  private path: number[][];
  /** 动画 */
  private animate: _SpriteAnimate;
  /** 动画组 */
  private animations: Texture<Resource>[][];
  /** 寻路移动函数 */
  private pathfindingMove?: () => void;
  /** 玩家移动累加回调 */
  private playerMove?: (x: number, y: number) => void;

  constructor() {
    super();

    //动画组
    this.animations = _generateFrames({
      texture: Assets.get("player"),
      width: 45,
      height: 60,
      col: 4,
      row: 4,
    });

    // 动画精灵
    this.animate = new _SpriteAnimate(this.animations[0], PlayerUI.SPEED);
    this.animate.scale.set(0.83);
    this.addChild(this.animate);

    _trigger100Times(() => {
      const { left, right, up, down } = this.playerMoveDirection;

      const px = PlayerUI.getMovePixel();
      if (left) this.x -= px;
      if (right) this.x += px;
      if (up) this.y -= px;
      if (down) this.y += px;

      //当前方向
      let direction: Game.DirectionFour = "down";

      if (left && !right) {
        direction = "left";
      } else if (right && !left) {
        direction = "right";
      } else if (up && !down) {
        direction = "up";
      } else if (down && !up) {
        direction = "down";
      }

      //如果方向发生变化，则转向
      if (this.lastDirection !== direction) {
        this.lastDirection = direction;
        const animate = this.animations[this.DIRECTIONS[direction]];
        this.animate.toggleTexture(animate);
      }

      //方向互斥或全方向停止时，停止动画
      if (
        (left && right) ||
        (up && down) ||
        Object.values(this.playerMoveDirection).every((v) => !v)
      ) {
        this.animate.stop();
      } else {
        this.animate.play();
      }
    });

    //键盘事件
    const keys: Record<string, Game.DirectionFour> = {
      KeyW: "up",
      KeyA: "left",
      KeyS: "down",
      KeyD: "right",
    };
    window.addEventListener("keydown", (e) => {
      if (Object.keys(keys).includes(e.code)) {
        this.killPathfindingMove();
        this.moveDirection(keys[e.code], true);
      }
    });
    window.addEventListener("keyup", (e) => {
      if (Object.keys(keys).includes(e.code)) {
        this.moveDirection(keys[e.code], false);
      }
    });
  }

  /** @description 注册事件 */
  setEvent(eventName: "move", callback: (x: number, y: number) => void): void;
  setEvent(eventName: "move", callback: (x: number, y: number) => void): void {
    if (eventName === "move") {
      this.playerMove = callback;
    }
  }

  /** @description 控制移动方向 */
  moveDirection(direction: Game.DirectionFour, status: boolean) {
    this.playerMoveDirection[direction] = status;
  }

  /** @description 开始寻路 */
  startFindWay(pageX: number, pageY: number) {
    //屏幕坐标转地图坐标
    let x = Math.abs(mapStore.x) + pageX;
    let y = Math.abs(mapStore.y) + pageY;

    const playerGridCoord = FindWayMapUI.getMapPosToGridCoord(playerStore.x, playerStore.y);
    const targetGridCoord = FindWayMapUI.getMapPosToGridCoord(x, y);

    //检查目标点周围的格子是否有障碍物，如果有障碍物，将目标点调整为其中心点
    if (this.hasObstacleAround(targetGridCoord.x, targetGridCoord.y)) {
      const { x: centerX, y: centerY } = FindWayMapUI.getGridCoordToMapPos(
        targetGridCoord.x,
        targetGridCoord.y,
      );
      x = centerX;
      y = centerY;
    }

    //计算从玩家到目标的路径
    this.path = FindWayMapUI.calculatePath(playerGridCoord, targetGridCoord);
    try {
      this.path = PF.Util.smoothenPath(mapStore.grid, this.path);
    } catch (error) {}
    this.moveGridPlayer(x, y);
  }

  /** @description 中断自动寻路移动 */
  killPathfindingMove() {
    this.pathfindingMove && Ticker.shared.remove(this.pathfindingMove);
    this.pathfindingMove = undefined;
  }

  /** @description 获取玩家在屏幕直角坐标系坐标 */
  getPlayerInScreenCoord() {
    const { x, y } = this.getGlobalPosition();
    const coordX = x - window.innerWidth / 2 + this.width / 2;
    const coordY = window.innerHeight / 2 - y - this.height / 2;
    return { coordX, coordY };
  }

  /** @description 玩家沿路径移动的逻辑
   * @param x 地图上点击的坐标
   * @param y 地图上点击的坐标
   */
  private moveGridPlayer(x: number, y: number) {
    this.killPathfindingMove();

    //忽略第一个路径点，因为玩家坐标已经在第一个路径点处
    let pathIndex = 1;

    const pixel = PlayerUI.getMovePixel();

    this.pathfindingMove = () => {
      if (pathIndex < this.path.length) {
        //获取下一个路径点目标点
        const nextPoint = this.path[pathIndex];

        let targetX = nextPoint[0] * FindWayMapUI.CELL_SIZE;
        let targetY = nextPoint[1] * FindWayMapUI.CELL_SIZE;

        //由于寻路结束会停留在单元格中心点，所以需要将最后一个路径终点设置为实际终点
        if (pathIndex === this.path.length - 1) {
          targetX = x - PlayerUI.SIZE.width / 2;
          targetY = y - PlayerUI.SIZE.height / 2;
        }

        //计算当前路径点与玩家的直线距离
        const dx = targetX - playerStore.x;
        const dy = targetY - playerStore.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        //到达路径点后，移动到下一个路径点
        if (distance < 1) {
          pathIndex++;
        } else {
          const x = (dx / distance) * pixel;
          const y = (dy / distance) * pixel;
          this.playerMove && this.playerMove(x, y);
        }
      } else {
        this.killPathfindingMove();
      }
    };

    //当路径寻路完成后，将精灵的位置更新为目标位置，避免下一次寻路时先到达中间
    Ticker.shared.add(this.pathfindingMove);
  }

  /**
   * @description 检查目标点周围是否有障碍物
   * @param targetCoord - 目标单元格行列
   */
  private hasObstacleAround(x: number, y: number) {
    const directions = [
      { x: 0, y: 1 }, //下
      { x: 0, y: -1 }, //上
      { x: 1, y: 0 }, //右
      { x: -1, y: 0 }, //左
      { x: -1, y: -1 }, //左上
      { x: -1, y: 1 }, //左下
      { x: 1, y: -1 }, //右上
      { x: 1, y: 1 }, //右下
    ];

    for (const dir of directions) {
      const neighborX = x + dir.x;
      const neighborY = y + dir.y;

      //确保邻近格子在有效范围内
      if (!mapStore.grid.isWalkableAt(neighborX, neighborY)) {
        return true;
      }
    }

    return false;
  }

  /** @description 获取玩家每1毫秒移动的像素 */
  static getMovePixel() {
    return (PlayerUI.SPEED / 10) * 2;
  }
}
