import { Container, Graphics } from "pixi.js";
import { gsap } from "gsap";

import { LibFillClick } from "./LibFillClick";
import { LibContainerSize } from "./LibContainerSize";

interface Params {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 滚动内容 */
  scrollContent: Container;
  /** 底部内边距 */
  bottomMargin?: number;
}

/** @description 滚动容器 */
export class LibScrollContainer extends LibContainerSize {
  /** 遮罩 */
  private maskGraphics: Graphics;
  /** 滚动的内容 */
  private content: Container;
  /** 开始位置 */
  private startY = 0;
  /** 是否处于拖动状态 */
  private isDragging: boolean;
  /** 滚动速度 */
  private scrollSpeed = 100;
  /** 惯性速度 */
  private velocity = 0;
  /** 滚动容器 */
  public scrollContent: Container;

  constructor(params: Params) {
    const { width, height, scrollContent, bottomMargin = 50 } = params;
    super(width, height);

    this.scrollContent = scrollContent;

    // 创建内容容器
    this.content = new Container();
    this.addChild(this.content);
    this.content.addChild(this.scrollContent);

    // 创建底部占位
    if (bottomMargin > 0) {
      const bottom_box = new LibFillClick(0, 0);
      this.content.addChild(bottom_box);
      bottom_box.y = this.content.height + bottomMargin;
    }

    // 创建遮罩
    this.maskGraphics = new Graphics();
    this.addChild(this.maskGraphics);
    this.maskGraphics.clear();
    this.maskGraphics.beginFill(0x000000);
    this.maskGraphics.drawRect(0, 0, width, height);
    this.maskGraphics.endFill();
    this.mask = this.maskGraphics;

    // 初始化拖动状态
    this.isDragging = false;
    this.scrollSpeed = 100;
    this.velocity = 0;

    // 添加事件监听
    this.eventMode = "static";
    this.on("pointerdown", this.onDragStart, this);
    this.on("pointermove", this.onDragMove, this);
    this.on("pointerup", this.onDragEnd, this);
    this.on("pointerupoutside", this.onDragEnd, this);
    this.on("wheel", this.onWheelScroll, this);
  }

  /** @description 设置滚动容器可视区宽高 */
  setDimensions(width: number, height: number) {
    // 更新遮罩尺寸
    this.maskGraphics.clear();
    this.maskGraphics.beginFill(0x000000);
    this.maskGraphics.drawRect(0, 0, width, height);
    this.maskGraphics.endFill();

    // 如果当前内容超出新高度，则调整位置
    // if (this.content.y < -(this.content.height - height)) {
    //   this.content.y = -(this.content.height - height);
    // }
  }

  /** @description 返回顶部 */
  scrollToTop() {
    this.content.y = 0;
  }

  /** @description 往滚动内容添加元素 */
  addContent(container: Container) {
    this.scrollContent.addChild(container);
  }

  /** @description 按下 */
  private onDragStart(event: any) {
    // 如果内容高度小于遮罩高度，则不滚动
    if (this.content.height <= this.maskGraphics.height) return;

    const position = event.data.getLocalPosition(this);
    this.startY = position.y - this.content.y;
    this.isDragging = true;
    this.velocity = 0; // 重置速度
    gsap.killTweensOf(this.content); // 停止惯性动画
  }

  /** @description 拖动 */
  private onDragMove(event: any) {
    if (this.isDragging) {
      const position = event.data.getLocalPosition(this);
      const newPosition = position.y - this.startY;
      this.velocity = newPosition - this.content.y;
      this.content.y = newPosition;
    }
  }

  /** @description 拖动结束 */
  private onDragEnd() {
    this.isDragging = false;
    this.applyInertia();
  }

  /** @description 滚轮滚动 */
  private onWheelScroll(event: WheelEvent) {
    // 如果内容高度小于遮罩高度，则不滚动
    if (this.content.height <= this.maskGraphics.height) return;
    let y = this.content.y - event.deltaY * (this.scrollSpeed / 100);

    if (y > 0) {
      y = 0;
    } else if (Math.abs(y) >= this.content.height - this.maskGraphics.height) {
      y = -(this.content.height - this.maskGraphics.height);
    }

    gsap.to(this.content, {
      duration: 0.25,
      ease: "power2.out",
      y,
    });
  }

  /** @description 惯性动画 */
  private applyInertia() {
    gsap.to(this.content, {
      y: this.content.y + this.velocity * 5,
      duration: 0.5,
      onUpdate: () => {
        // 在更新时限制滚动范围
        if (this.content.y > 0) {
          gsap.to(this.content, {
            duration: 0.25,
            y: 0,
          });
        }
        // 如果滚动距离大于内容高度减去遮罩高度
        else if (Math.abs(this.content.y) >= this.content.height - this.maskGraphics.height) {
          // 如果内容高度大于遮罩高度，则滚动到底部
          if (this.content.height > this.maskGraphics.height) {
            const y = -(this.content.height - this.maskGraphics.height);
            gsap.to(this.content, {
              duration: 0.25,
              y,
            });
          }
          // 否则，滚动到顶部
          else {
            gsap.to(this.content, {
              duration: 0.25,
              y: 0,
            });
          }
        }
      },
    });
  }
}
