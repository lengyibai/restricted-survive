import gsap from "gsap";
import { Application, type Container } from "pixi.js";
import _debounce from "lodash/debounce";

export const app = new Application<HTMLCanvasElement>({
  resizeTo: window,
  antialias: false,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
});

app.view.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

interface Screen extends Container {
  resize: (width: number, height: number) => void;
}

class Navigation {
  /** 当前显示的屏幕 */
  currentScreen: Screen;

  constructor() {
    const updateView = _debounce(() => {
      this.updateViewSize();
    });

    window.addEventListener("resize", updateView);
  }

  /** @description 更新视图大小 */
  updateViewSize() {
    if (!this.currentScreen) return;
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    this.currentScreen.resize?.(winWidth, winHeight);
  }

  /** @description 显示指定屏幕 */
  async showScreen(screen: any) {
    // 如果已经有屏幕，则隐藏并销毁它
    if (this.currentScreen) {
      await this.hideAndRemoveScreen(this.currentScreen);
    }
    this.addAndShowScreen(screen);
    this.updateViewSize();
  }

  /** 从舞台移除屏幕，取消链接更新和调整大小函数 */
  protected async hideAndRemoveScreen(screen: Container) {
    return new Promise<void>((resolve) => {
      gsap.to(screen, {
        duration: 0.5,
        alpha: 0,
        onComplete() {
          screen.eventMode = "none";
          screen.visible = false;
          screen.destroy({ children: true });
          resolve();
        },
      });
    });
  }

  /** 创建新屏幕并将其添加到舞台 */
  protected addAndShowScreen(screen: any) {
    this.currentScreen = new screen();
    app.stage.addChild(this.currentScreen);
    this.currentScreen.alpha = 0;

    gsap.to(this.currentScreen, {
      duration: 0.5,
      alpha: 1,
    });
  }
}

/** 共享的导航实例 */
export const navigation = new Navigation();
