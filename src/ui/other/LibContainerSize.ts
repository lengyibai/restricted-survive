import { Container } from "pixi.js";

import { LibFillClick } from "./LibFillClick";
import { LibRectBgColor } from "./LibRectBgColor";

/** @description 可设置大小的容器 */
export class LibContainerSize extends Container {
  /** 填充容器 */
  private fill: LibFillClick;
  /** 背景色填充 */
  private bgColorFill: LibRectBgColor;

  constructor(width: number, height: number, bgColor?: string) {
    super();

    if (bgColor) {
      this.bgColorFill = new LibRectBgColor({
        width,
        height,
        bgColor,
      });
      this.addChild(this.bgColorFill);
    } else {
      this.fill = new LibFillClick(width, height);
      this.addChild(this.fill);
    }
  }

  /** @description 设置容器大小 */
  setSize(width: number, height: number) {
    if (this.fill) {
      this.fill.width = width;
      this.fill.height = height;
    }

    if (this.bgColorFill) {
      this.bgColorFill.renderBg(width, height);
    }
  }
}
