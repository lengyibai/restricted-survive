import { Sprite } from "pixi.js";

/** @description 专门用于填充容器（仅仅用于让容器支持点击事件） */
export class LibFillClick extends Sprite {
  constructor(width: number, height: number) {
    super();

    this.width = width;
    this.height = height;
  }
}
