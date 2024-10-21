import { BitmapText } from "pixi.js";

import { LibContainerSize } from "./LibContainerSize";

import { _setCenter } from "@/utils/pixiTool";

/** @description 位图文本使用 */
export class LibBitText {
  /** 字体名称 */
  private fontName: string;
  /* 字体大小 */
  private fontSize?: number;

  constructor(fontName: string, fontSize?: number) {
    this.fontName = fontName;
    this.fontSize = fontSize;
  }

  /** @description 生成位图文本 */
  createText(text: string, fontSize?: number) {
    const bitMapText = new BitmapText(text, {
      fontName: this.fontName,
      fontSize: this.fontSize || fontSize,
    });

    return bitMapText;
  }

  /** @description 生成带有容器的位图文本 */
  createTextWithContainer(width: number, text: string, fontSize?: number) {
    const bitMapText = new BitmapText(text, {
      fontName: this.fontName,
      fontSize: this.fontSize || fontSize,
    });

    //容器填充
    const container = new LibContainerSize(width, bitMapText.height);
    container.addChild(bitMapText);
    _setCenter(container, bitMapText, "xy");

    const setText = (newText: string) => {
      bitMapText.text = newText;
      _setCenter(container, bitMapText, "xy");
    };

    return {
      container,
      setText,
    };
  }
}
