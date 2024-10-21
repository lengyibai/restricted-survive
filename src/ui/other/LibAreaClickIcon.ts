import { type Texture } from "pixi.js";

import { LibContainerSize } from "./LibContainerSize";
import { LibImgSprite } from "./LibImgSprite";

import { _setCenter } from "@/utils/pixiTool";

/** @description 解决当图片有空隙时，无法准确点击图片，如箭头和关闭按钮 */
export class LibAreaClickIcon extends LibContainerSize {
  constructor(texture: Texture, w?: number, h?: number) {
    const icon = new LibImgSprite({
      texture,
    });

    icon.width = w || icon.width;
    icon.height = h || icon.height;

    const size = Math.max(icon.width, icon.height);
    super(size, size);
    this.addChild(icon);
    _setCenter(this, icon, "xy");
  }
}
