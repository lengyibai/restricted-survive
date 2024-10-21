import gsap from "gsap";
import { type DisplayObject, type Container, Text, BitmapText } from "pixi.js";

import { _setFilter } from "./pixiTool";

type FadeFunctions = {
  show: () => void;
  hide: () => void;
};

/** @description 手动控制淡入淡出 */
export function _createFadeFunctions(
  element: DisplayObject,
  duration: number = 0.25,
): FadeFunctions {
  return {
    show: () => {
      gsap.to(element, { alpha: 1, duration });
    },
    hide: () => {
      gsap.to(element, { alpha: 0, duration });
    },
  };
}

class PixiAnimates {
  /** 抬起回调数组 */
  private upCallbacks: Function[] = [];

  constructor() {
    window.addEventListener("pointerup", () => {
      this.upCallbacks = this.upCallbacks.filter((cb) => {
        return !cb();
      });
    });
  }

  /** @description 悬浮变灰、按下缩小、抬起回弹 */
  animateA(el: Container) {
    el.pivot.set(el.width / 2, el.height / 2);

    el.on("pointerenter", () => {
      el.filters = [_setFilter("brightness", 0.85)];
    });

    el.on("pointerleave", () => {
      el.filters = [];
    });
    el.on("pointerdown", () => {
      gsap.to(el.scale, {
        x: 0.95,
        y: 0.95,
        duration: 0.05,
      });
    });

    this.upCallbacks.push(() => {
      if (el.destroyed) return true;

      // 元素放大并带有回弹效果
      gsap.to(el.scale, {
        x: 1,
        y: 1,
        duration: 0.25,
        ease: "elastic.out(2, 0.5)",
      });
    });
  }

  /** @description 悬浮按下变灰、抬起离开重置 */
  animateB(el: Container) {
    el.on("pointerenter", () => {
      el.filters = [_setFilter("brightness", 0.9)];
    });

    el.on("pointerdown", () => {
      el.filters = [_setFilter("brightness", 0.75)];
    });

    el.on("pointerleave", () => {
      el.filters = [];
    });

    this.upCallbacks.push(() => {
      el.filters = [];
    });
  }

  /** @description 悬浮加亮、按下变灰、抬起离开重置 */
  animateC(el: Container) {
    el.on("pointerenter", () => {
      el.filters = [_setFilter("brightness", 1.25)];
    });
    el.on("pointerdown", () => {
      el.filters = [_setFilter("brightness", 0.9)];
    });
    el.on("pointerleave", () => {
      el.filters = [_setFilter("brightness", 1)];
    });
    this.upCallbacks.push(() => {
      el.filters = [_setFilter("brightness", 1)];
    });
  }
}
export const _pixiAnimates = new PixiAnimates();

export class CommonAnim {
  /**
   * 数字放大滚动
   * @param numTxt
   * @param end 滚动目标数值
   * @param start 滚动起始值
   * @param from 开始scale值
   * @param to 放大scale值
   */
  static scaleRollNum(
    numTxt: Text | BitmapText,
    end: number,
    start?: number,
    from: number = 1,
    to: number = 1.6,
  ): void {
    // @ts-ignore
    let curTxt = numTxt.text;
    // 修正阿拉伯文
    curTxt = curTxt.replace(/(\u202b)|(\u202c)/g, "");
    let fix = "x";
    let xIdx = curTxt.indexOf(fix);
    if (xIdx === -1) {
      fix = "X";
      xIdx = curTxt.indexOf(fix);
    }
    if (!start) {
      let tempTxt = curTxt;
      if (xIdx > -1) {
        tempTxt = tempTxt.replace(fix, "");
      }
      start = Number(tempTxt);
      if (isNaN(start)) {
        console.error(
          "Can't convert a 'string' type of the Text to a 'number' type, please set the param start!",
        );
        start = end;
      }
    }
    if (start === end) return;
    const obj = { n: start };
    const tl = gsap.timeline();
    tl.to(
      numTxt,
      {
        duration: 0.15,
        pixi: { scale: to },
      },
      0,
    );
    tl.to(
      numTxt,
      {
        duration: 0.15,
        pixi: { scale: from },
      },
      0.35,
    );
    tl.to(
      obj,
      {
        duration: 0.5,
        n: end,
        onUpdate: () => {
          if (xIdx === -1) {
            // @ts-ignore
            numTxt.text = obj.n.toFixed(2);
          } else if (xIdx === 0) {
            // @ts-ignore
            numTxt.text = `${fix}${obj.n.toFixed(2)}`;
          } else {
            // @ts-ignore
            numTxt.text = `${obj.n.toFixed(2)}${fix}`;
          }
        },
      },
      0,
    );
    tl.eventCallback("onComplete", () => {
      tl.clear();
      tl.kill();
    });
  }

  /**
   * 突变 从fromScale经zoomDur时间突变到scale 然后经dur还原
   * @param obj 突变
   * @param scale 大小
   * @param dur 还原时间
   * @param zoomDur 突变时间
   * @param fromScale 突变开始大小
   * @param onComplete 结束回调
   */
  static zoomScale(
    obj: any,
    scale: number,
    dur: number,
    zoomDur: number = 0.1,
    fromScale: number = 1,
    onComplete?: Function,
  ): void {
    const tl = gsap.timeline();
    tl.fromTo(
      obj,
      { pixi: { scale: fromScale } },
      {
        duration: zoomDur,
        pixi: { scale: scale },
        ease: "cubic.in",
        onStart: () => {
          obj.visible = true;
        },
      },
    ).to(obj, {
      duration: dur,
      pixi: { scale: 1 },
      ease: "cubic.out",
      onComplete: () => {
        onComplete && onComplete();
      },
    });
    tl.eventCallback("onComplete", () => {
      tl.clear();
      tl.kill();
    });
  }

  /**
   * 震动效果
   * @param objs 震动对象列表
   * @param dur 持续时间
   * @param frequency 频率
   * @param offsetMin 最小幅度
   * @param offsetMax 最大幅度
   */
  static shock(
    objs: any[],
    dur: number,
    frequency: number = 20,
    offsetMin: number = 2,
    offsetMax: number = 4,
  ) {
    const tl = gsap.timeline();
    objs.forEach((obj) => {
      obj["s_x"] = obj.x;
      obj["s_y"] = obj.y;
    });
    const n = frequency;
    const pDur = dur / n;
    for (let i = 0; i < n - 1; i++) {
      const radians = Math.random() * 2 * Math.PI;
      const dt = Math.floor(Math.random() * (offsetMax - offsetMin)) + offsetMin;
      objs.forEach((obj) => {
        const tx = obj["s_x"] + Math.cos(radians) * dt;
        const ty = obj["s_y"] + Math.sin(radians) * dt;
        tl.to(
          obj,
          {
            duration: pDur,
            x: tx,
            y: ty,
            ease: "bounce.inOut",
            onComplete: () => {
              if (i === n - 1 - 1) {
                obj.x = obj["s_x"];
                obj.y = obj["s_y"];
              }
            },
          },
          pDur * i,
        );
      });
    }
    tl.eventCallback("onComplete", () => {
      tl.clear();
      tl.kill();
    });
  }
}
