import { Assets, Container, type Resource, type Texture } from "pixi.js";

import { LibImgSprite } from "@/ui/other/LibImgSprite";
import { _generateFrames, _SpriteAnimate } from "@/utils/pixiTool";

/** @description 玩家 */
export class PlayerUI extends Container {
  /** 当前速度，米/秒，默认为4 */
  static readonly SPEED = 10;
  /** 玩家大小 */
  static readonly SIZE = {
    width: 50,
    height: 50,
  };
  /** 动画 */
  private animate: _SpriteAnimate;
  /** 动画组 */
  private animations: Texture<Resource>[][];

  constructor() {
    super();

    this.animations = _generateFrames({
      texture: Assets.get("player"),
      width: 45,
      height: 45,
      col: 4,
      row: 4,
    });

    // 创建动画精灵
    this.animate = new _SpriteAnimate(this.animations[0], PlayerUI.SPEED);
    this.addChild(this.animate);
    this.animate.play();
  }

  /** @description 获取玩家在屏幕直角坐标系坐标 */
  getPlayerInScreenCoord() {
    const { x, y } = this.getGlobalPosition();
    const coordX = x - window.innerWidth / 2 + this.width / 2;
    const coordY = window.innerHeight / 2 - y - this.height / 2;
    return { coordX, coordY };
  }

  /** @description 移动玩家到指定坐标
   * @param x 地图上点击的坐标
   * @param y 地图上点击的坐标
   */
  // movePlayer(x: number, y: number) {}

  /** @description 获取玩家每1毫秒移动的像素 */
  static getPlayerMovePixel() {
    return (PlayerUI.SPEED / 10) * 2;
  }
}
