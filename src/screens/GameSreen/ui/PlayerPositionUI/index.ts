import { Container } from "pixi.js";

import { LibText } from "@/ui/other/LibText";

/** @description 玩家坐标 */
export class PlayerPositionUI extends Container {
  /** 文本 */
  private text: LibText;

  constructor() {
    super();

    this.text = new LibText({
      text: "X: 0, Y: 0",
      fontSize: 20,
    });
    this.addChild(this.text);
  }

  /** @description 设置坐标 */
  setPlayerPosition(x: number, y: number) {
    this.text.text = `X: ${x.toFixed(0)}, Y: ${y.toFixed(0)}`;
  }
}
