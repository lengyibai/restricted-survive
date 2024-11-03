import { Assets, type Resource, type Texture } from "pixi.js";

import { _generateFrames, _SpriteAnimate, _trigger100Times } from "@/utils/pixiTool";
import { AutoFindPath } from "@/utils/baseClass";
import { mapStore } from "@/store/map";
import { _getMapPosToGridCoord } from "@/utils/private";

/** @description 玩家 */
export class PlayerUI extends AutoFindPath {
  protected speed = 20;
  protected animate: _SpriteAnimate;
  protected animations: Texture<Resource>[][];
  protected lastDirection: Game.DirectionFour | null = null;
  protected onMove?: (x: number, y: number) => void;
  protected size = {
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
  /** 是否处于键盘按下 */
  private isKeyDown = false;

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
    this.animate = new _SpriteAnimate(this.animations[0], this.speed);
    this.animate.scale.set(0.83);
    this.addChild(this.animate);

    //按键实时响应
    _trigger100Times(() => {
      if (!this.isKeyDown) return;
      const { left, right, up, down } = this.playerMoveDirection;

      const px = this.getMovePixel();
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

      this.turnDirection(direction);
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
        this.isKeyDown = true;
        this.moveDirection(keys[e.code], true);
      }
    });
    window.addEventListener("keyup", (e) => {
      if (Object.keys(keys).includes(e.code)) {
        this.moveDirection(keys[e.code], false);

        //如果没有按下任何方向键，则停止动画
        if (Object.values(this.playerMoveDirection).every((v) => !v)) {
          this.isKeyDown = false;
          this.resetDirection();
        }
      }
    });

    setTimeout(() => {
      const fn = () => {
        const position = mapStore.getRandomWalkableGrid({ x: this.x, y: this.x });
        if (position) {
          const { x, y } = position;
          this.startFindWay(x, y, "map").then(() => {
            fn();
          });
        }
      };
      fn();
    }, 1000);
  }

  /** @description 摇杆事件 */
  joystickMove(dx: number, dy: number) {
    const px = this.getMovePixel();
    this.x += dx * px;
    this.y -= dy * px;
    this.killPathfindingMove();

    //当前方向
    let direction: Game.DirectionFour = "down";

    //判断移动方向
    if (dx === 1 || ((dy < 0.5 || dy > -0.5) && dx === 1)) {
      direction = "right";
    }
    if (dx === -1 || ((dy < 0.5 || dy > -0.5) && dx === -1)) {
      direction = "left";
    }
    if (dy === 1 || ((dx < 0.5 || dx > -0.5) && dy === 1)) {
      direction = "up";
    }
    if (dy === -1 || ((dx < 0.5 || dx > -0.5) && dy === -1)) {
      direction = "down";
    }

    //如果方向发生变化，则转向
    this.turnDirection(direction);

    //如果没有按下摇杆，则停止动画
    if (dx === 0 && dy === 0) {
      this.animate.stop();
    }
  }

  /** @description 获取玩家在屏幕直角坐标系坐标 */
  getPlayerInScreenCoord() {
    const { x, y } = this.getGlobalPosition();
    const coordX = x - window.innerWidth / 2 + this.width / 2;
    const coordY = window.innerHeight / 2 - y - this.height / 2;
    return { coordX, coordY };
  }

  protected turnDirection(direction: Game.DirectionFour) {
    //如果方向发生变化，则转向
    if (this.lastDirection === direction) return;

    this.lastDirection = direction;
    const animate = this.animations[this.DIRECTIONS[direction]];
    this.animate.toggleTexture(animate);
    this.animate.play();
  }

  /** @description 重置转向 */
  protected resetDirection() {
    this.lastDirection = null;
    this.animate.stop();
  }

  /** @description 控制移动方向 */
  private moveDirection(direction: Game.DirectionFour, status: boolean) {
    status && this.killPathfindingMove();
    this.playerMoveDirection[direction] = status;
  }
}
