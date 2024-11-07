import { Assets, type Resource, type Texture } from "pixi.js";

import { _generateFrames, _SpriteAnimate } from "@/utils/pixiTool";
import { AutoFindPath } from "@/utils/baseClass";
import { mapStore } from "@/store/map";

/** @description 鸡 */
export class AnimalChicken extends AutoFindPath {
  protected speed = 20;
  protected animate: _SpriteAnimate;
  protected animations: Texture<Resource>[][];
  protected lastDirection: Game.DirectionFour | null = null;
  protected onMove?: (x: number, y: number) => void;
  protected size = {
    width: 32,
    height: 32,
  };

  /** 精灵动画索引映射 */
  private DIRECTIONS: Record<string, number> = {
    down: 0,
    left: 1,
    right: 2,
    up: 3,
  };

  /** 是否处于追逐玩家 */
  private isChasing = false;

  constructor() {
    super();

    this.animations = _generateFrames({
      texture: Assets.get("chicken"),
      width: 32,
      height: 32,
      col: 3,
      row: 4,
    });

    // 创建动画精灵
    this.animate = new _SpriteAnimate(this.animations[0], this.speed);
    this.addChild(this.animate);

    const fn = () => {
      const { x, y } = this.getCenterPoint();
      const position = mapStore.getRandomWalkableGrid({ x, y });
      if (position) {
        const { x, y } = position;
        this.startFindWay(x, y).then(() => {
          fn();
        });
      }
    };
    fn();

    // setTimeout(() => {
    //   Ticker.shared.add(() => {
    //     const distance = _getStartEndDistance(playerStore.x, this.x, playerStore.y, this.y);
    //     if (distance < 100) {
    //       this.isChasing = true;
    //       this.killPathfindingMove();

    //       const maxDistance = Math.max(
    //         Math.abs(playerStore.x - this.x),
    //         Math.abs(playerStore.y - this.y),
    //       );

    //       if (distance >= 25) {
    //         this.x += ((playerStore.x - this.x) / maxDistance) * this.getMovePixel();
    //         this.y += ((playerStore.y - this.y) / maxDistance) * this.getMovePixel();
    //         const direction = _getVHDirection(this.x, this.y, playerStore.x, playerStore.y);
    //         this.turnDirection(direction);
    //       } else {
    //         this.resetDirection();
    //       }
    //     } else {
    //       if (this.isChasing) {
    //         fn();
    //         this.isChasing = false;
    //       }
    //     }
    //   });
    // }, 1000);
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
}
