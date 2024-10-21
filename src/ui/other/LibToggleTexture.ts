import { Container, type Texture } from "pixi.js";

import { LibImgSprite } from "./LibImgSprite";

interface Params {
  /** 图标资源 */
  texture: Texture;
  /** 悬浮图标 */
  hoverTexture: Texture;
  /** 图标宽度 */
  width: number;
  /** 图标高度 */
  height: number;
  /** 染色 */
  tintColor?: string;
}

/** @description 悬浮切换材质 */
export class LibToggleTexture extends Container {
  /** 按钮 */
  private btn: LibImgSprite;
  /** 默认材质 */
  private texture: Texture;
  /** 悬浮材质 */
  private hoverTexture: Texture;
  /** 染色 */
  private tintColor?: string;

  constructor(params: Params) {
    super();

    const { texture, width, height, hoverTexture, tintColor } = params;
    this.texture = texture;
    this.hoverTexture = hoverTexture;
    this.tintColor = tintColor;

    //创建图标容器
    const iconBox = new Container();
    this.addChild(iconBox);
    iconBox.eventMode = "static";
    iconBox.cursor = "pointer";

    //创建图标
    this.btn = new LibImgSprite({
      texture,
      width,
      height,
    });
    iconBox.addChild(this.btn);
    this.btn.x = iconBox.width / 2 - 5;
    this.btn.y = iconBox.height / 2 - 5;
    this.btn.pivot.set(this.btn.width / 2, this.btn.height / 2);
    tintColor && (this.btn.tint = tintColor);

    iconBox.on("pointerenter", () => {
      this.btn.texture = this.hoverTexture;
      this.btn.tint = "#fff";
    });
    iconBox.on("pointerleave", () => {
      this.btn.texture = this.texture;
      tintColor && (this.btn.tint = tintColor);
    });
  }

  /** @description 切换材质 */
  toggleTexture(texture: Texture, hoverTexture: Texture) {
    this.texture = texture;
    this.hoverTexture = hoverTexture;
    this.btn.texture = hoverTexture;
  }

  /** @description 屏蔽 */
  setDisabled(status: boolean) {
    this.btn.tint = status ? "#7C7C7C" : this.tintColor || "#fff";
  }
}
