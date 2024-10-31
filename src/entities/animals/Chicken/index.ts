import { Assets, type Resource, type Texture } from "pixi.js";

import { _generateFrames, _SpriteAnimate } from "@/utils/pixiTool";
import { AutoFindPath } from "@/utils/baseClass";

/** @description 鸡 */
export class AnimalChicken extends AutoFindPath {
  protected speed = 10;
  protected animate: _SpriteAnimate;
  protected animations: Texture<Resource>[][];
  protected lastDirection: Game.DirectionFour | null = null;
  protected onMove?: (x: number, y: number) => void;
  protected size = {
    width: 32,
    height: 32,
  };

  /** 按键Key与精灵动画索引映射 */
  private DIRECTIONS: Record<string, number> = {
    down: 0,
    left: 1,
    right: 2,
    up: 3,
  };

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

    setTimeout(() => {
      // this.startFindWay(700, 300);
    }, 1000);
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
