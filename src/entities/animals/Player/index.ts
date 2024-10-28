import { Assets, Container, Graphics, Ticker, type Resource, type Texture } from "pixi.js";

import { _generateFrames, _SpriteAnimate, _trigger100Times } from "@/utils/pixiTool";
import { FindWayMapUI } from "@/screens/GameSreen/ui/FindWayMapUI";
import { _getMovementDirectionWithDiagonals, _getVerticalHorizontalDirection } from "@/utils/tool";

/** @description 牛 */
export class PlayerUI extends Container {
  /** 速度 */
  static readonly SPEED = 10;
  /** @description 当前寻路路径 */
  private path: number[][];
  /** 动画 */
  private animate: _SpriteAnimate;
  /** 动画组 */
  private animations: Texture<Resource>[][];
  /** 寻路移动函数 */
  private pathfindingMove?: () => void;
  /** 按下不同方向键时，控制玩家移动方向状态 */
  private playerMoveDirection: Record<string, boolean> = {
    left: false,
    right: false,
    up: false,
    down: false,
  };
  /** 上一次移动的方向 */
  private lastDirection: string;
  /** 上一次玩家坐标 */
  private lastPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    super();

    this.animations = _generateFrames({
      texture: Assets.get("player"),
      width: 45,
      height: 60,
      col: 4,
      row: 4,
    });

    // 创建动画精灵
    this.animate = new _SpriteAnimate(this.animations[2], PlayerUI.SPEED);
    this.addChild(this.animate);
    this.animate.play();

    //摄像头跟随玩家移动
    _trigger100Times(() => {
      //键盘移动玩家
      const px = PlayerUI.getMovePixel();
      if (this.playerMoveDirection.left) this.x -= px;
      if (this.playerMoveDirection.right) this.x += px;
      if (this.playerMoveDirection.up) this.y -= px;
      if (this.playerMoveDirection.down) this.y += px;

      const directions: Record<string, number> = {
        down: 0,
        left: 1,
        right: 3,
        up: 2,
      };

      let direction = "";
      if (this.playerMoveDirection.left) {
        direction = "left";
      } else if (this.playerMoveDirection.right) {
        direction = "right";
      } else if (this.playerMoveDirection.up) {
        direction = "up";
      } else if (this.playerMoveDirection.down) {
        direction = "down";
      } else {
        direction = "down";
      }

      if (this.lastDirection !== direction) {
        this.lastDirection = direction;
        const animate = this.animations[directions[direction]];
        this.animate.toggleTexture(animate);
      }

      if (Object.values(this.playerMoveDirection).every((v) => !v)) {
        this.animate.stop();
      } else {
        this.animate.play();
      }
    });
  }

  /** @description 开始寻路 */
  startFindWay(gridX: number, gridY: number) {
    const moverGridCoord = FindWayMapUI.getMapPosToGridCoord(this.x, this.y);
    const targetMapCoord = FindWayMapUI.getGridCoordToMapPos(gridX, gridY);

    this.path = FindWayMapUI.calculatePath(moverGridCoord, { x: gridX, y: gridY });
    const clearPath = this.drawPath(this.path, targetMapCoord.x, targetMapCoord.y);
    this.moveGridPlayer(targetMapCoord.x, targetMapCoord.y).then(() => {
      clearPath();
    });
  }

  /** @description 控制移动方向 */
  move(direction: string, status: boolean) {
    this.playerMoveDirection[direction] = status;
  }

  /** @description 玩家沿路径移动的逻辑
   * @param x 地图上点击的坐标
   * @param y 地图上点击的坐标
   */
  private moveGridPlayer(x: number, y: number) {
    return new Promise<void>((resolve) => {
      //忽略第一个路径点，因为坐标已经在第一个路径点处
      let pathIndex = 1;
      //上一次方向
      let lastDirection: ReturnType<typeof _getMovementDirectionWithDiagonals>;

      const pixel = PlayerUI.getMovePixel();

      this.pathfindingMove = () => {
        if (pathIndex < this.path.length) {
          //获取下一个路径点目标点
          const nextPoint = this.path[pathIndex];

          let targetX = nextPoint[0] * FindWayMapUI.CELL_SIZE + this.width / 4;
          let targetY = nextPoint[1] * FindWayMapUI.CELL_SIZE;

          //由于寻路结束会停留在单元格中心点，所以需要将最后一个路径终点设置为实际终点
          if (pathIndex === this.path.length - 1) {
            targetX = x - this.width / 2;
            targetY = y - this.height / 2;
          }

          //计算当前路径点与玩家的直线距离
          const dx = targetX - this.x;
          const dy = targetY - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          //到达路径点后，移动到下一个路径点
          if (distance < 1) {
            pathIndex++;
          } else {
            const x = (dx / distance) * pixel;
            const y = (dy / distance) * pixel;
            this.x += x;
            this.y += y;
          }
        } else {
          this.animate.stop();
          this.pathfindingMove && Ticker.shared.remove(this.pathfindingMove);
          resolve();
        }
      };

      //当路径寻路完成后，将精灵的位置更新为目标位置，避免下一次寻路时先到达中间
      Ticker.shared.add(this.pathfindingMove);
    });
  }

  /** @description 绘制路径 */
  private drawPath(path: number[][], targetX: number, targetY: number) {
    const pathGraphics = new Graphics();
    this.parent.addChild(pathGraphics);

    if (path.length > 0) {
      pathGraphics.lineStyle(2, "#fff", 0.1);

      for (let i = 0; i < path.length; i++) {
        const point = path[i];
        const { x, y } = FindWayMapUI.getGridCoordToMapPos(point[0], point[1]);

        //路径起点为当前玩家坐标
        if (i === 0) {
          pathGraphics.moveTo(this.x + this.width / 2, this.y + this.height / 2);
        } else if (i === path.length - 1) {
          pathGraphics.lineTo(targetX, targetY);
        } else {
          pathGraphics.lineTo(x, y);
        }
      }
    }

    return () => {
      pathGraphics.clear();
    };
  }

  /** @description 获取每1毫秒移动的像素 */
  static getMovePixel() {
    return (PlayerUI.SPEED / 10) * 2;
  }
}
