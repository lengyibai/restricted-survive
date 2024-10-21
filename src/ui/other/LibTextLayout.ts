import type { LibText } from "./LibText";
import { LibContainerSize } from "./LibContainerSize";

/** @description 文本布局，在指定宽度中水平居中 */
export class LibTextLayout extends LibContainerSize {
  /** 文本 */
  private libText: LibText;

  constructor(text: LibText, width: number) {
    super(width, text.height);

    this.libText = text;

    //容器填充
    this.addChild(text);
    text.x = (width - text.width) / 2;
  }

  get text() {
    return this.libText.text;
  }
  set text(value: string) {
    this.libText.text = value;
  }
}
