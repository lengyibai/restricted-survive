import { Container } from "pixi.js";
import gsap from "gsap";

import { _setCenter } from "../../utils/pixiTool";

import { LibRectBgColor } from "./LibRectBgColor";

interface Params {
  /** 弹窗内容 */
  content: Container;
  /** 竖版初始大小 */
  size?: number;
}

/** @description 弹窗组件 */
export class LibDialog extends Container {
  /** 蒙版UI */
  private maskUI: LibRectBgColor;
  /** 居中容器 */
  private centerContainer: Container;
  /** 内容容器 */
  private dialogContainer: Container;

  constructor(params: Params) {
    super();

    const { content, size = 1.25 } = params;

    this.visible = false;

    //蒙版
    this.maskUI = new LibRectBgColor({
      bgColor: "#000",
      width: 1920,
      height: 1080,
    });
    this.addChild(this.maskUI);
    this.maskUI.alpha = 0.5;
    this.maskUI.eventMode = "static";
    _setCenter(this, this.maskUI, "xy");

    //居中容器
    this.centerContainer = new Container();
    this.addChild(this.centerContainer);
    this.centerContainer.x = this.width / 2;
    this.centerContainer.y = this.height / 2;

    //弹窗内容容器
    this.dialogContainer = new Container();
    this.dialogContainer.addChild(content);
    this.centerContainer.addChild(this.dialogContainer);
    const w = this.dialogContainer.width / 2;
    const h = this.dialogContainer.height / 2;
    this.dialogContainer.pivot.set(w, h);
    this.dialogContainer.scale.set(0);
    this.dialogContainer.alpha = 0;

    this.resize(window.innerWidth, window.innerHeight);

    window.addEventListener("resize", () => {
      this.resize(window.innerWidth, window.innerHeight, size);
    });
  }

  /** @description 显示 */
  show() {
    this.visible = true;
    gsap.to(this.maskUI, {
      duration: 0.5,
      alpha: 0.5,
    });
    gsap.to(this.dialogContainer, {
      duration: 0.5,
      alpha: 1,
    });
    gsap.to(this.dialogContainer.scale, {
      duration: 0.5,
      ease: "back.out",
      x: 1,
      y: 1,
    });
  }

  /** @description 关闭 */
  close() {
    gsap.to(this.dialogContainer.scale, {
      duration: 0.5,
      ease: "back.in",
      x: 0,
      y: 0,
    });

    gsap.to(this.dialogContainer, {
      duration: 0.5,
      delay: 0.25,
      alpha: 0,
    });

    gsap.to(this.maskUI, {
      duration: 0.5,
      delay: 0.25,
      alpha: 0,
      onComplete: () => {
        this.visible = false;
      },
    });
  }

  /** @description 大小调整
   * @param w 宽
   * @param h 高
   */
  private resize(w: number, h: number, size = 1.25) {
    const s = Math.max(w / 1920, h / 1080);

    this.maskUI.pivot.set(1920 / 2, 1080 / 2);
    this.maskUI.position.set(w / 2, h / 2);
    this.maskUI.scale.set(s, s);

    let scale = 1;

    if (w < h) {
      scale = Math.min((w / 1080) * size, (h / 1920) * size);
    } else {
      scale = Math.min(w / 1920, h / 1080);
    }

    this.centerContainer.position.set(w / 2, h / 2);
    this.centerContainer.scale.set(scale, scale);
  }
}
