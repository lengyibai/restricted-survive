import { Container } from "pixi.js";

import { LibRectBgColor } from "@/ui/other/LibRectBgColor";
import { LibText } from "@/ui/other/LibText";
import { _isPhone } from "@/utils/tool";
import { _setFilter } from "@/utils/pixiTool";
import { _pixiAnimates } from "@/utils/animate";

/** @description 最小最大按钮 */
export class MinMaxBtn extends Container {
  /** 容器背景 */
  minBox: LibRectBgColor;
  /** 文本 */
  minMaxText: LibText;

  constructor(text: string, radius: number[], callback: () => void) {
    super();

    // 创建min文本容器
    this.minBox = new LibRectBgColor({
      width: 69 * (_isPhone ? 0.9 : 1),
      height: 54 * (_isPhone ? 0.7 : 1),
      radius,
      bgColor: "#2E3139",
    });
    this.addChild(this.minBox);
    this.minBox.eventMode = "static";
    this.minBox.cursor = "pointer";
    this.minBox.on("pointerdown", callback);
    _pixiAnimates.animateB(this.minBox);

    //创建文本
    this.minMaxText = new LibText({
      text,
      fontSize: _isPhone ? 16 : 20,
      fontColor: "#96a5b2",
    });
    this.minBox.addChild(this.minMaxText);
    this.minMaxText.x = this.width / 2 - this.minMaxText.width / 2;
    this.minMaxText.y = this.height / 2 - this.minMaxText.height / 2;
  }

  /** @description 设置高亮 */
  setHightLight(isHightLight: boolean) {
    this.minBox.filters = [_setFilter("brightness", isHightLight ? 1.25 : 1)];
    this.minMaxText.setColor(isHightLight ? "#fff" : "#96a5b2");
    this.minMaxText.style.fontWeight = isHightLight ? "bold" : "normal";
  }
}
