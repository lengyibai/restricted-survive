import { Container, Graphics, type Sprite, type Texture } from "pixi.js";

import { LibImgSprite } from "./LibImgSprite";

interface Params {
  /** 背景宽度 */
  bgWidth: number;
  /** 背景高度 */
  bgHeight: number;
  /** 进度条宽度 */
  barWidth: number;
  /** 进度条高度 */
  barHeight: number;
  /** 背景纹理 */
  bgTexture: Texture;
  /** 进度条纹理 */
  barTexture: Texture;
}

/** @description 进度条 */
export class LibProgress extends Container {
  /** 光条图 */
  private progressBar: Sprite;
  /** 蒙版 */
  private maskGraphics: Graphics;

  constructor(params: Params) {
    super();

    const { bgWidth, bgHeight, barWidth, barHeight, bgTexture, barTexture } = params;

    // 背景图
    const background = new LibImgSprite({
      width: bgWidth,
      height: bgHeight,
      texture: bgTexture,
    });
    this.addChild(background);

    // 光条图
    this.progressBar = new LibImgSprite({
      width: barWidth,
      height: barHeight,
      texture: barTexture,
    });
    this.addChild(this.progressBar);
    this.progressBar.x = (bgWidth - barWidth) / 2;
    this.progressBar.y = (bgHeight - barHeight) / 2;

    // 创建蒙版
    const mask = new Graphics();
    mask.beginFill(0xffffff); // 创建一个白色矩形
    mask.drawRect(0, 0, 0, this.progressBar.height);
    mask.endFill();
    this.progressBar.addChild(mask); // 将蒙版添加到容器
    this.progressBar.mask = mask; // 设置蒙版
    this.maskGraphics = mask;
  }

  /** @description 更新进度 */
  setProgress(progress: number) {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    this.maskGraphics.clear();
    this.maskGraphics.beginFill(0xffffff);
    this.maskGraphics.drawRect(
      0,
      0,
      this.progressBar.width * clampedProgress,
      this.progressBar.height,
    );

    this.maskGraphics.endFill();
  }
}
