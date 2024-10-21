import { Container, Texture } from "pixi.js";

import { LibImgSprite } from "./LibImgSprite";
import { LibText } from "./LibText";
import { LibContainerSize } from "./LibContainerSize";
import { LibRectBgColor } from "./LibRectBgColor";
import type { InputField } from "./LibInputField";
import { LibAreaClickIcon } from "./LibAreaClickIcon";

import { _arrangeGrid, _setCenter, _setEvent } from "@/utils/pixiTool";

/** @description 事件名 */
interface Events {
  /** 输入事件 */
  input?: (value: string) => void;
  /** 收起事件 */
  hide?: () => void;
  /** 显示事件 */
  show?: (y: number) => void;
}

/** @description 手机端浮动键盘 */
class LibFloatInput extends Container {
  /** 当前输入的值 */
  private value = "";
  /** 事件 */
  private events: Events;
  /** 当前处于聚焦的输入框 */
  private focusedInput: InputField;
  /** 当前需要抬升的距离 */
  private moveY = 0;
  /** 输入状态下需要屏蔽的容器 */
  private disableContainer: Container[];

  constructor() {
    super();

    this.eventMode = "static";

    //按键
    const boxs: Container[] = [];
    const keysContainer = new Container();
    [1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0].forEach((item) => {
      const keyContainer = new Container();

      //背景
      const keyBg = new LibImgSprite({
        texture: Texture.from("assets/platform/gem/img/float_input_annaiu.png"),
        width: 158,
        height: 73,
      });
      keyBg.tint = "#57575F";
      keyContainer.addChild(keyBg);

      //数字
      const num = new LibText({
        text: item.toString(),
        fontSize: 36,
        fontColor: "#fff",
      });
      keyContainer.addChild(num);
      _setCenter(keyContainer, num, "xy");

      keysContainer.addChild(keyContainer);
      boxs.push(keyContainer);

      _setEvent(keyContainer, "pointerdown", () => {
        keyBg.tint = "#fff";
        num.style.fill = "#000";
      });
      _setEvent(keyContainer, "pointerup", () => {
        keyBg.tint = "#57575F";
        num.style.fill = "#fff";
      });
      _setEvent(keyContainer, "pointerleave", () => {
        keyBg.tint = "#57575F";
        num.style.fill = "#fff";
      });
      _setEvent(keyContainer, "pointertap", () => {
        this.updateValue(this.value + item.toString());
      });
    });

    //删除键
    const delContainer = new LibContainerSize(158, 73);
    const del = new LibImgSprite({
      texture: Texture.from("assets/platform/gem/img/float_input_sanchu.png"),
    });
    delContainer.addChild(del);
    del.x = 60;
    del.y = 25;
    del.tint = "#8E8E8E";
    keysContainer.addChild(delContainer);
    _setEvent(delContainer, "pointerdown", () => {
      del.tint = "#fff";
    });
    _setEvent(delContainer, "pointerup", () => {
      del.tint = "#8E8E8E";
    });
    _setEvent(delContainer, "pointertap", () => {
      this.updateValue(this.value.slice(0, -1));
    });

    this.addChild(keysContainer);
    _arrangeGrid([...boxs, delContainer], 20, 3);
    _setCenter(this, keysContainer, "xy");

    //背景
    const bg = new LibRectBgColor({
      width: this.width + 50,
      height: this.height + 75,
      bgColor: "#24242E",
    });
    this.addChild(bg);
    this.swapChildren(keysContainer, bg);
    keysContainer.x = 25;
    keysContainer.y = 60;

    //收起键
    const keyHide = new LibAreaClickIcon(
      Texture.from("assets/platform/gem/img/float_input_jiantou.png"),
      28,
      16,
    );
    this.addChild(keyHide);
    keyHide.x = this.width - keyHide.width - 25;
    keyHide.y = 20;
    _setEvent(keyHide, "pointerup", () => {
      this.events.hide?.();
      this.focusedInput.onBlur();
      this.disableContainer.forEach((item) => {
        item.eventMode = "static";
      });
    });

    // 监听触摸事件
    window.addEventListener("touchstart", (e) => {
      this.moveY = e.touches[0].clientY - window.innerHeight / 2;
    });
  }

  /** @description 设置事件
   * @param disableContainer 输入状态下屏蔽的容器
   * @param events 事件
   */
  setEvent(disableContainer: Container[], events: Events) {
    this.disableContainer = disableContainer;
    this.events = { ...this.events, ...events };
  }

  /** @description 添加输入框 */
  addInput(input: InputField) {
    _setEvent(input, "pointerup", () => {
      this.focusedInput = input;
      this.focusedInput.onFocus();
      this.events.show?.(this.moveY);
      this.updateValue(this.focusedInput.content);
      this.disableContainer.forEach((item) => {
        item.eventMode = "none";
      });
    });
  }

  /** @description 输入的值 */
  private updateValue(value: string) {
    this.focusedInput.setValue(value);
    this.value = this.focusedInput.content;
  }
}

export const libFloatInput = new LibFloatInput();
