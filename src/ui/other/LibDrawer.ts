import { Container } from "pixi.js";
import gsap from "gsap";

import { LibRectBgColor } from "./LibRectBgColor";

import { _setCenter } from "@/utils/pixiTool";

interface Params {
  /** 弹窗内容 */
  content: Container;
}

/** @description 抽屉组件 */
export class LibDrawer extends Container {
  /** 蒙版UI */
  private maskUI: LibRectBgColor;
  /** 抽屉容器 */
  private drawerContainer: Container;
  /** 当前屏幕高度 */
  private h: number;

  constructor(params: Params) {
    super();

    const { content } = params;

    this.visible = false;

    //蒙版
    this.maskUI = new LibRectBgColor({
      bgColor: "#000",
      width: 1080,
      height: 1920,
    });
    this.addChild(this.maskUI);
    this.maskUI.alpha = 0.5;
    this.maskUI.eventMode = "static";
    _setCenter(this, this.maskUI, "xy");

    //弹窗内容容器
    this.drawerContainer = content;
    this.addChild(this.drawerContainer);

    this.resize();
  }

  /** @description 显示 */
  show() {
    this.visible = true;
    gsap.to(this.maskUI, {
      duration: 0.5,
      alpha: 0.5,
    });

    gsap.to(this.drawerContainer, {
      duration: 0.5,
      y: this.h - this.drawerContainer.height,
    });
  }

  /** @description 关闭 */
  close() {
    gsap.to(this.drawerContainer, {
      duration: 0.5,
      y: this.h,
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

  /** @description 大小调整 */
  resize(w = window.innerWidth, h = window.innerHeight) {
    this.h = h;

    let scale = Math.max(w / 1080, h / 1920);
    this.maskUI.pivot.set(1080 / 2, 1920);
    this.maskUI.position.set(w / 2, h);
    this.maskUI.scale.set(scale);

    scale = Math.min(w / 1080, h / 1920);
    this.drawerContainer.scale.set(scale);
    this.drawerContainer.x = (w - this.drawerContainer.width) / 2;
    this.drawerContainer.y = this.visible ? h - this.drawerContainer.height : this.h;
  }
}
