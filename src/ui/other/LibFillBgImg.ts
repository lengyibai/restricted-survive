import { Assets } from "pixi.js";

import { LibImgSprite } from "./LibImgSprite";

/** @description 填满屏幕自适应的背景图片 */
export class LibFillBgImg extends LibImgSprite {
  constructor(img: string) {
    super({
      width: 1920,
      height: 1080,
      texture: Assets.get(img),
    });
  }

  resize(w: number, h: number) {
    const halfW = 1920 / 2;
    const halfH = 1080 / 2;
    const bgImgScale = Math.max(w / 1920, h / 1080);
    this.pivot.set(halfW, halfH);
    this.position.set(w / 2, h / 2);
    this.scale.set(bgImgScale, bgImgScale);
  }
}
