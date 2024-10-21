import { Container, Graphics, Texture, type FederatedPointerEvent } from "pixi.js";
import _debounce from "lodash/debounce";

import { LibRectBgColor } from "../LibRectBgColor";
import { LibImgSprite } from "../LibImgSprite";

import { MinMaxBtn } from "./ui/MinMaxBtn";

import { _horizontalVerticalScale, _setShadow, OutsideClick } from "@/utils/pixiTool";
import { _isPhone } from "@/utils/tool";
import { $t } from "@/language";

const outsideClick = new OutsideClick();

/** @description 滑动选择器 */
export class LibRange extends Container {
  private dragging = false;
  private sliderKnob: LibImgSprite;
  private sliderBg: Graphics;
  private minBtn: MinMaxBtn;
  private maxBtn: MinMaxBtn;
  private minX: number;
  private maxX: number;
  private spineScale = 1;
  private onChange: (value: number) => void;

  constructor(btn: Container, onChange: (value: number) => void) {
    super();

    this.onChange = onChange;
    this.eventMode = "static";

    this.spineScale = _isPhone
      ? _horizontalVerticalScale.verticalScreenInfo.scale * 2.25
      : _horizontalVerticalScale.horizontalScreenInfo.scale;

    window.addEventListener(
      "resize",
      _debounce(() => {
        this.spineScale = _isPhone
          ? _horizontalVerticalScale.verticalScreenInfo.scale * 2.25
          : _horizontalVerticalScale.horizontalScreenInfo.scale;
      }, 1000),
    );

    // 创建容器背景
    const bg = new LibRectBgColor({
      width: _isPhone ? 270 : 312,
      height: 64 * (_isPhone ? 0.75 : 1),
      bgColor: "#212328",
      radius: 5,
    });
    this.addChild(bg);

    this.minBtn = new MinMaxBtn($t("min"), [5, 0, 0, 5], () => {
      this.onMinClick();
    });
    this.addChild(this.minBtn);
    this.minBtn.x = 5;
    this.minBtn.y = 5;
    this.minBtn.setHightLight(true);

    this.maxBtn = new MinMaxBtn($t("max"), [0, 5, 5, 0], () => {
      this.onMaxClick();
    });
    this.addChild(this.maxBtn);
    this.maxBtn.x = this.width - this.maxBtn.width - 5;
    this.maxBtn.y = 5;

    // 创建滑动条背景
    this.sliderBg = new LibRectBgColor({
      width: _isPhone ? 110 : 130,
      height: _isPhone ? 8 : 12,
      bgColor: "#000000",
      radius: 6,
    });
    this.addChild(this.sliderBg);
    this.sliderBg.x = this.width / 2 - this.sliderBg.width / 2;
    this.sliderBg.y = this.height / 2 - this.sliderBg.height / 2;
    this.sliderBg.eventMode = "static";
    this.sliderBg.on("pointerdown", this.onBgClick.bind(this));

    // 设置滑动条背景的最小和最大X值
    this.minX = this.sliderBg.x;
    this.maxX = this.sliderBg.x + this.sliderBg.width;

    // 创建滑块
    this.sliderKnob = new LibImgSprite({
      width: 25 * (_isPhone ? 0.65 : 1),
      height: 43 * (_isPhone ? 0.65 : 1),
      texture: Texture.from("assets/platform/gem/img/lib_range_slider.png"),
    });
    this.addChild(this.sliderKnob);
    this.sliderKnob.x = this.sliderBg.x - this.sliderKnob.width / 2;
    this.sliderKnob.y = 10;
    this.sliderKnob.eventMode = "static";
    this.sliderKnob.cursor = "pointer";
    this.sliderKnob.on("pointerdown", this.onDragStart.bind(this));

    outsideClick.setContainerCallback(this, btn, () => {
      this.visible = false;
    });

    _setShadow(this);
  }

  /** @description 更新滑块位置
   * @param value 滑块的位置，取值范围 0 到 1
   */
  updateSliderPosition(value: number) {
    value = Math.max(0, Math.min(1, value));
    const newPosition = this.minX + value * (this.maxX - this.minX);
    this.sliderKnob.x = newPosition - this.sliderKnob.width / 2;
    this.changeValue(value);
  }

  private onDragStart() {
    this.dragging = true;
    this.sliderKnob.alpha = 0.5;
    window.addEventListener("pointermove", this.onDragMove.bind(this));
    window.addEventListener("pointerup", this.onDragEnd.bind(this));
  }

  private onDragMove(event: PointerEvent) {
    if (this.dragging) {
      const rect = this.sliderBg.getBounds();
      const newPosition = Math.max(
        this.minX,
        Math.min((event.clientX - rect.left) / this.spineScale + this.minX, this.maxX),
      );
      this.sliderKnob.x = newPosition - this.sliderKnob.width / 2;
      const value = (newPosition - this.minX) / (this.maxX - this.minX);
      this.onChange(value);
      this.changeValue(value);
    }
  }

  private onDragEnd() {
    this.dragging = false;
    this.sliderKnob.alpha = 1;
    window.removeEventListener("pointermove", this.onDragMove.bind(this));
    window.removeEventListener("pointerup", this.onDragEnd.bind(this));
  }

  private onMinClick() {
    this.sliderKnob.x = this.minX - this.sliderKnob.width / 2;
    this.onChange(0);
    this.changeValue(0);
  }

  private onMaxClick() {
    this.sliderKnob.x = this.maxX - this.sliderKnob.width / 2;
    this.onChange(1);
    this.changeValue(1);
  }

  private onBgClick(event: FederatedPointerEvent) {
    const rect = this.sliderBg.getBounds();
    const newPosition = Math.max(
      this.minX,
      Math.min((event.clientX - rect.left) / this.spineScale + this.minX, this.maxX),
    );
    this.sliderKnob.x = newPosition - this.sliderKnob.width / 2;
    const value = (newPosition - this.minX) / (this.maxX - this.minX);
    this.onChange(value);
  }

  /** @description 当前滑块值 */
  changeValue(value: number) {
    this.minBtn.setHightLight(value === 0);
    this.maxBtn.setHightLight(value === 1);
  }
}
