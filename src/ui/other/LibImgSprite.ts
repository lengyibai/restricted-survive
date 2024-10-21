import { Sprite, type Texture } from "pixi.js";

interface ImgSprite {
  /** 资源 */
  texture: Texture;
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 锚点 */
  anchor?: any;
}

/** @description 设置图片精灵，也适合用于背景填充 */
export class LibImgSprite extends Sprite {
  constructor(options: ImgSprite) {
    const { texture, width, height, anchor = 0 } = options;

    super(texture);

    width && (this.width = width);
    height && (this.height = height);
    this.anchor.set(anchor);
  }
}
