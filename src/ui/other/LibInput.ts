import { Ticker } from "pixi.js";
import Decimal from "decimal.js";

import { LibContainerSize } from "./LibContainerSize";

interface Params {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 字体颜色 */
  color?: string;
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
  /** 获得焦点回调 */
  onFocus?: () => void;
  /** 输入回调 */
  onInput?: (text: number | string) => void;
  /** 失去焦点回调 */
  onBlur?: (text: number | string) => void;
}

/** @description 动态缩放移动输入框，注意：此输入框仅用于可视区，不能用于局部滚动内，因为输入框因为层级问题而溢出 */
export class LibInput extends LibContainerSize {
  /** 输入框dom */
  private input: HTMLInputElement;
  /** 最小值 */
  private min: number;
  /** 最大值 */
  private max: number;
  /** 是否整数 */
  private integer: boolean;
  /** 是否负数 */
  private isNegative: boolean;
  /** 获得焦点回调 */
  private onFocus: () => void;
  /** 输入回调 */
  private onInput: (text: number | string) => void;
  /** 失去焦点回调 */
  private onBlur: (text: number | string) => void;

  constructor(params: Params) {
    const {
      color = "#fff",
      width,
      height,
      value = "",
      integer = false,
      isNegative = false,
      min = -Infinity,
      max = Infinity,
      maxLength = 10,
      align = "left",
      onFocus = () => {},
      onInput = () => {},
      onBlur = () => {},
    } = params;

    super(width, height);

    this.min = min;
    this.max = max;
    this.integer = integer;
    this.isNegative = isNegative;
    this.onFocus = onFocus;
    this.onInput = onInput;
    this.onBlur = onBlur;

    this.input = document.createElement("input");
    this.input.style.cssText = `
      position: absolute;
      border: none;
      outline: none;
      padding: 0 0.5em;
      background-color: transparent;
      color: ${color};
      text-align: ${align};
      `;
    this.input.value = value;
    this.input.maxLength = maxLength;
    document.body.appendChild(this.input);

    Ticker.shared.add(this.updateInputPosition, this);

    this.input.addEventListener("focus", () => {
      this.onFocus();
    });
    this.input.addEventListener("input", () => {
      this.onInput(this.input.value);
    });
    this.input.addEventListener("blur", () => {
      this.onBlurHandler();
      this.onBlur(this.input.value);
    });
  }

  /** @description 设置值 */
  setValue(v: string | number) {
    this.input.value = v.toString();
  }

  /** @description 设置最大值 */
  setMax(max: number) {
    this.max = max;
  }

  /** @description 设置禁用状态 */
  setDisabled(disabled: boolean) {
    if (disabled) {
      this.input.style.opacity = "0.5";
      this.input.style.pointerEvents = "none";
    } else {
      this.input.style.opacity = "1";
      this.input.style.pointerEvents = "auto";
    }
  }

  /** @description 设置输入框隐藏显示 */
  setInputVisible(visible: boolean) {
    if (visible) {
      this.input.style.display = "block";
    } else {
      this.input.style.display = "none";
    }
  }

  /** @description 失去焦点处理 */
  private onBlurHandler = () => {
    //如果是正无穷，则不处理
    if (this.input.value === "∞") return;
    this.setValue(parseFloat(this.input.value) || 0);

    //保留两位小数且不四舍五入
    const value = new Decimal(this.input.value);
    this.input.value = parseFloat(value.toFixed(2, Decimal.ROUND_DOWN)).toString();

    //如果不是负数，输入值小于最小值，则使用最小值
    if (!this.isNegative && Number(this.input.value) < this.min) {
      this.input.value = this.min.toString();
    }

    //如果存在最大值，且输入值大于最大值，则使用最大值
    if (this.max && Number(this.input.value) > this.max) {
      this.setValue(this.max);
    }

    //如果为空，则使用最小值
    if (this.input.value === "") {
      this.setValue(this.min);
    }

    //如果要求整数，则取整
    if (this.integer) {
      this.setValue(parseInt(this.input.value));
    }

    this.setValue(this.input.value);
  };

  /** @description 实时更新输入框位置 */
  private updateInputPosition() {
    const bounds = this.getBounds();

    this.input.style.left = `${bounds.x}px`;
    this.input.style.top = `${bounds.y}px`;
    this.input.style.width = `${bounds.width}px`;
    this.input.style.height = `${bounds.height}px`;
    this.input.style.fontSize = `${bounds.height * 0.4}px`;
  }
}
