import { Assets } from "pixi.js";

import { GameSreen } from "../..";

import { LibImgSprite } from "@/ui/other/LibImgSprite";

/** @description 玩家 */
export class PlayerUI extends LibImgSprite {
  /** 玩家大小 */
  static readonly SIZE = {
    width: 50,
    height: 50,
  };
  constructor() {
    super({
      texture: Assets.get("player"),
    });
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
    return (GameSreen.SPPEND / 10) * 2;
  }
}
