import Decimal from "decimal.js";
import { Ticker, Text, TextMetrics } from "pixi.js";

import { LibRectBgColor } from "./LibRectBgColor";
import { LibContainerSize } from "./LibContainerSize";

import { _overflowHidden } from "@/utils/pixiTool";
import { _isPad, _isPhone } from "@/utils/tool";

interface InputFieldOptions {
  /** 字体大小 */
  fontSize?: number;
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 背景颜色 */
  backgroundColor?: string | number;
  /** 文字颜色 */
  textColor?: string;
  /** 初始值 */
  value?: string;
  /** 是否整数 */
  integer?: boolean;
  /** 是否允许输入负数 */
  isNegative?: boolean;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 最大长度 */
  maxLength?: number;
  /** 对齐方式 */
  align?: "left" | "center";
  /** 默认值 */
  defaultValue?: string;
  /** 失去焦点回调 */
  onBlur?: (text: number | string) => void;
}

export class InputField extends LibContainerSize {
  /** 输入显示的文本 */
  private inputText: Text;
  /** 光标 */
  private cursorLine: CursorLine;
  /** 光标位置 */
  private cursorIndex: number;
  /** 是否聚焦 */
  private isFocused: boolean;
  /** 最小值 */
  private min: number;
  /** 最大值 */
  private max: number;
  /** 是否整数 */
  private integer: boolean;
  /** 是否负数 */
  private isNegative: boolean;
  /** 对齐方式 */
  private align: "left" | "center";
  /** 最大长度 */
  private maxLength: number;
  /** 失去焦点 */
  private blur: (text: string) => void;
  /** 默认值，当内容为空时使用，如∞ */
  private defaultValue: string;
  /** 内容 */
  content: string;

  constructor({
    fontSize = 24,
    width = 300,
    height = 55,
    textColor = "#fff",
    value = "",
    integer = false,
    isNegative = false,
    min = 0,
    max = Infinity,
    maxLength = 10,
    align = "left",
    onBlur = () => {},
    defaultValue = "",
  }: InputFieldOptions) {
    super(width, height);

    this.eventMode = "static";
    this.cursor = "text";

    this.content = value;
    this.cursorIndex = this.content.length;
    this.isFocused = true;
    this.min = min;
    this.max = max;
    this.integer = integer;
    this.isNegative = isNegative;
    this.align = align;
    this.maxLength = maxLength;
    this.blur = onBlur;
    this.defaultValue = defaultValue;

    _overflowHidden(this);

    //创建文本
    this.inputText = new Text(this.content, {
      fill: textColor,
      fontSize,
      align: this.align,
    });
    this.inputText.position.set(10, (height - this.inputText.height) / 2);
    this.addChild(this.inputText);

    // 创建光标
    this.cursorLine = new CursorLine(textColor, this.inputText.height);
    this.updateCursorPos();
    this.addChild(this.cursorLine);

    this.on("pointertap", this.onFocus.bind(this));

    if (!(_isPhone || _isPad)) {
      window.addEventListener("pointerdown", this.onGlobalPointerDown.bind(this));
      window.addEventListener("keydown", this.onKeyDown.bind(this));
    }

    // 默认失去焦点
    this.onBlur(false);
  }

  /** @description 设置最大值 */
  setMax(max: number) {
    this.max = max;
  }

  /** @description 设置值 */
  setValue(value: string | number) {
    let v = value.toString();
    if (v.length > 1 && v.includes("∞")) {
      v = v.replace("∞", "");
    }
    if (v.length > this.maxLength) return;
    this.content = v;
    this.inputText.text = this.content;
    this.cursorIndex = v.length;
    this.updateCursorPos();
  }

  /** @description 设置禁用状态 */
  setDisabled(disabled: boolean) {
    if (disabled) {
      this.alpha = 0.5;
      this.eventMode = "none";
    } else {
      this.alpha = 1;
      this.eventMode = "static";
    }
  }

  /** @description 聚焦 */
  onFocus() {
    this.setFocusState(true);
    this.cursorIndex = this.content.length;
    this.updateCursorPos();
  }

  /** @description 失去焦点
   * @param needUpdate 是否更新
   */
  onBlur(needUpdate = true) {
    if (!this.isFocused) return;
    this.setFocusState(false);
    const value = this.checkValue(this.content);
    needUpdate && this.blur(value);
    this.setValue(value);
  }

  /** @description 检验值 */
  private checkValue(v: string) {
    let content = v.toString();

    content = content ? content : this.defaultValue;

    //如果是正无穷，则不处理
    if (content === "∞") return content;

    //如果为空，则使用最小值
    if (content === "") {
      content = this.min.toString();
    }

    content = parseFloat(content).toString() || "0";

    //如果要求整数，则取整
    if (this.integer) {
      content = parseInt(content).toString();
    }

    //如果存在最大值，且输入值大于最大值，则使用最大值
    if (this.max && Number(content) > this.max) {
      content = this.max.toString();
    }

    //如果不允许为负数，且输入值小于最小值，则使用最小值
    if (!this.isNegative && Number(content) < this.min) {
      content = this.min.toString();
    }

    //保留两位小数且不四舍五入
    const decimalValue = new Decimal(content);
    content = parseFloat(decimalValue.toFixed(2, Decimal.ROUND_DOWN)).toString();

    return content;
  }

  /** @description 设置焦点状态 */
  private setFocusState(isFocused: boolean) {
    this.isFocused = isFocused;
    this.cursorLine.setCursorState(isFocused);
  }
  /** @description 更新光标位置 */
  private updateCursorPos() {
    const metrics = TextMetrics.measureText(
      this.content.slice(0, this.cursorIndex),
      this.inputText.style,
    );

    let xPos = 10 + metrics.width;

    if (this.align === "center") {
      const textWidth = TextMetrics.measureText(this.content, this.inputText.style).width;
      xPos = (this.width - textWidth) / 2 + metrics.width;
    }

    this.cursorLine.position.set(xPos, this.inputText.y);
  }

  /** @description 如果点击位置没有在输入框，则设置为失去焦点状态，只在电脑端生效 */
  private onGlobalPointerDown(event: MouseEvent) {
    const bounds = this.getBounds();
    if (!bounds.contains(event.clientX, event.clientY)) {
      this.onBlur();
    }
  }

  /** @description 键盘事件，只在电脑端生效 */
  private onKeyDown(event: KeyboardEvent) {
    if (!this.isFocused) return;

    if (event.key === "Backspace") {
      if (this.cursorIndex > 0) {
        this.cursorIndex--;
        this.updateCursorPos();
        this.setValue(this.content.slice(0, -1));
      }
    } else if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "."].includes(event.key)) {
      this.setValue(this.content + event.key);
    }
  }
}

/** @description 创建光标 */
class CursorLine extends LibRectBgColor {
  /** 光标闪烁定时器 */
  private cursorBlinkTicker: Ticker;
  /** 是否处于聚焦 */
  private isFocused = false;

  constructor(bgColor: string, height: number) {
    super({
      width: 2,
      height,
      bgColor,
    });

    this.eventMode = "static";

    // 光标闪烁
    this.cursorBlinkTicker = new Ticker();
    this.cursorBlinkTicker.add(() => {
      if (this.isFocused) {
        this.alpha = Math.sin(Date.now() / 200) > 0 ? 1 : 0;
      }
    });
    this.cursorBlinkTicker.start();
  }

  /** @description 设置光标状态 */
  setCursorState(isFocused: boolean) {
    this.isFocused = isFocused;
    if (isFocused) {
      this.alpha = 1;
      this.cursorBlinkTicker.start();
    } else {
      this.alpha = 0;
      this.cursorBlinkTicker.stop();
    }
  }
}
