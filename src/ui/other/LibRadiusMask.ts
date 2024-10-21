import { Graphics, type Container } from "pixi.js";

/** @description 为容器设置圆角蒙版 */
export class LibRadiusMask extends Graphics {
  constructor(contanier: Container, radius: number = 15) {
    super();

    //如果容器的宽高为0，则抛出错误
    if (contanier.width === 0 || contanier.height === 0) {
      throw new Error("容器的宽高不能为0，请检查容器是否已添加到舞台");
    }
    this.beginFill(0xffffff);
    this.drawRoundedRect(0, 0, contanier.width, contanier.height, radius);
    this.endFill();
    contanier.mask = this;
    contanier.addChild(this);
  }
}
