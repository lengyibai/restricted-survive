import { Container, type FederatedEvent } from "pixi.js";
import gsap from "gsap";

import { LibContainerSize } from "./LibContainerSize";

import { _overflowHidden } from "@/utils/pixiTool";

/** @description 滑动UI */
export class LibSlider extends LibContainerSize {
  /** 当前幻灯片索引 */
  private currentIndex = 0;
  /** 滑动区域宽度 */
  private slideWidth = 0;
  /** 记录拖动开始时的X坐标 */
  private startX = 0;
  /** 偏移量 */
  private offsetX = 0;
  /** 最大索引 */
  private pageNum = 0;
  /** 记录开始时间 */
  private startTime = new Date().getTime();
  /* 是否正在拖动 */
  private isDragging = false;
  /** 滑动内容 */
  private slideArea: Container;
  /** @description 滑动回调 */
  private slideCallback: (pageIndex: number, pageNum: number) => void;

  constructor(
    width: number,
    height: number,
    content: Container,
    slideCallback: (pageIndex: number, pageNum: number) => void,
  ) {
    super(width, height);
    _overflowHidden(this);

    this.slideWidth = width;
    this.slideArea = content;
    this.slideCallback = slideCallback;
    this.pageNum = Math.floor(content.width / this.slideWidth) - 1;
    this.addChild(content);

    // 监听拖动事件
    this.eventMode = "static";
    this.cursor = "pointer";

    this.on("pointerdown", this.onDragStart);
    this.on("pointermove", this.onDragMove);
    this.on("pointerup", this.onDragEnd);
    this.on("pointerupoutside", this.onDragEnd);
  }

  /** @description 上一页 */
  prev() {
    this.slideTo(this.currentIndex - 1);
  }

  /** @description 下一页 */
  next() {
    this.slideTo(this.currentIndex + 1);
  }

  /** @description 滑动到指定索引 */
  private slideTo(index: number) {
    if (index < 0) {
      // 回弹到第一张
      gsap.to(this.slideArea, { x: 0, duration: 0.25 });
      this.currentIndex = 0;
    } else if (index > this.pageNum) {
      // 回弹到最后一张
      gsap.to(this.slideArea, {
        x: -this.pageNum * this.slideWidth,
        duration: 0.5,
      });
      this.currentIndex = this.pageNum;
    } else {
      // 正常滑动
      this.currentIndex = index;
      gsap.to(this.slideArea, {
        x: -this.currentIndex * this.slideWidth,
        duration: 0.25,
      });
    }

    this.slideCallback(this.currentIndex, this.pageNum);
  }

  /** @description 开始拖动 */
  private onDragStart(event: any) {
    this.isDragging = true;
    this.startX = event.data.global.x;
    this.offsetX = this.slideArea.x;
    gsap.killTweensOf(this.slideArea);
    this.startTime = new Date().getTime();
  }

  /** @description 拖动中 */
  private onDragMove(event: FederatedEvent) {
    if (!this.isDragging) return;
    const moveX = event.pageX - this.startX;
    this.slideArea.x = this.offsetX + moveX;
  }

  /** @description 结束拖动 */
  private onDragEnd(event: FederatedEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;
    const endTime = new Date().getTime() - this.startTime;
    const slide = this.startX - event.pageX;
    const slideSpeed = Math.abs(slide) / endTime;

    //滑动距离阈值，滑动到一半以上必定翻页
    const slideThreshold = this.slideWidth / 2;
    //滑动速度阈值，滑动速度大于这个值，必定翻页
    const speedThreshold = 0.275;

    //如果滑动距离大于阈值，或速度大于阈值翻页
    if (Math.abs(slide) > slideThreshold || slideSpeed > speedThreshold) {
      slide > 0 ? this.currentIndex++ : this.currentIndex--;
    }

    this.slideTo(this.currentIndex);
  }
}
