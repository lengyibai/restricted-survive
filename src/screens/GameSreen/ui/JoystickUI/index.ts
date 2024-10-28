import { Container, Graphics } from "pixi.js";
//导入 Pixi.js 中的容器和图形类

import { _setEvent, _trigger100Times } from "@/utils/pixiTool";
//导入自定义的事件绑定工具函数

export class JoystickUI extends Container {
  /** 底部圆圈，用于表示摇杆的基础区域 */
  private base: Graphics;
  /** 可拖动的小圆圈，用于表示摇杆的控制点 */
  private thumb: Graphics;
  /** 摇杆的半径，决定其活动范围 */
  private radius: number;
  /** 标志是否正在拖动摇杆 */
  private isDragging: boolean;
  /** 摇杆输出值 */
  private result = { x: 0, y: 0 };
  /** 处理摇杆移动的回调函数 */
  private onMove: (dx: number, dy: number) => void;
  /** 处理摇杆离开的回调函数 */
  private onLeave: () => void;

  constructor(radius: number) {
    super();
    this.radius = radius;
    this.isDragging = false;

    //创建摇杆基础区域（底部圆圈）
    this.base = new Graphics();
    this.base.beginFill(0x555555, 0.5);
    this.base.drawCircle(0, 0, radius);
    this.base.endFill();
    this.addChild(this.base);

    //创建摇杆控制点（小圆圈）
    this.thumb = new Graphics();
    this.thumb.beginFill(0xffffff);
    this.thumb.drawCircle(0, 0, radius / 3);
    this.thumb.endFill();
    this.addChild(this.thumb);

    _setEvent(this, "pointerdown", this.onPointerDown.bind(this));
    _setEvent(this, "pointerup", this.onPointerUp.bind(this));
    _setEvent(this, "pointerupoutside", this.onPointerUp.bind(this));

    _trigger100Times(() => {
      //如果累积时间达到或超过100ms，执行逻辑
      if (this.isDragging) {
        this.onMove?.(this.result.x, this.result.y);
      }
    });
  }

  /** @description 按下摇杆 */
  private onPointerDown() {
    this.isDragging = true;
    window.addEventListener("pointermove", this.onGlobalPointerMove);
  }

  /** @description 松开摇杆 */
  private onPointerUp() {
    this.isDragging = false;
    this.thumb.position.set(0, 0);
    this.onMove?.(0, 0);
    window.removeEventListener("pointermove", this.onGlobalPointerMove);
  }

  /** @description 全局移动 */
  private onGlobalPointerMove = (e: PointerEvent) => {
    if (!this.isDragging) return;
    this.moveThumb(e);
  };

  /** @description 移动摇杆 */
  private moveThumb(globalPosition: PointerEvent) {
    //计算鼠标与摇杆中心距离
    const dx = globalPosition.clientX - this.x;
    const dy = globalPosition.clientY - this.y;

    //计算指针与中心点的距离和角度
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    //如果指针超出摇杆半径，则固定在边缘
    if (distance > this.radius) {
      this.thumb.x = this.radius * Math.cos(angle);
      this.thumb.y = this.radius * Math.sin(angle);
    } else {
      this.thumb.x = dx;
      this.thumb.y = dy;
    }

    const x = this.thumb.x / this.radius;
    const y = -(this.thumb.y / this.radius);

    this.result.x = x;
    this.result.y = y;

    //摇杆标准输出值
    if (Math.abs(x) > Math.abs(y)) {
      this.result.x = x > 0 ? 1 : -1;
    } else {
      this.result.y = y > 0 ? 1 : -1;
    }
  }

  /** @description 注册事件 */
  addEvent(eventName: "move", callback: (dx: number, dy: number) => void): void;
  addEvent(eventName: "leave", callback: () => void): void;
  addEvent(
    eventName: "move" | "leave",
    callback: (() => void) | ((dx: number, dy: number) => void),
  ): void {
    if (eventName === "move") {
      this.onMove = callback;
    }
    if (eventName === "leave") {
    }
  }
}
