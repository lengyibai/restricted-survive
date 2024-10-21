import gsap from "gsap";

import { LibImgSprite } from "./LibImgSprite";
import { LibContainerSize } from "./LibContainerSize";

import { _setEvent } from "@/utils/pixiTool";
import { _degToRad } from "@/utils/tool";

interface Params {
  /** 按钮素材 */
  sprite: LibImgSprite;
  /** 点击回调 */
  onClick: () => void;
}

/** @description 右上角关闭按钮，支持悬浮旋转动画 */
export class LibCloseBtn extends LibContainerSize {
  constructor(params: Params) {
    const { sprite, onClick } = params;

    super(sprite.width, sprite.height);

    this.addChild(sprite);
    sprite.pivot.set(sprite.width / 2, sprite.height / 2);
    sprite.x = sprite.width / 2;
    sprite.y = sprite.height / 2;

    _setEvent(this, "pointerenter", () => {
      gsap.to(sprite, {
        duration: 0.25,
        rotation: _degToRad(180),
      });
    });

    _setEvent(this, "pointerleave", () => {
      sprite.alpha = 1;
      gsap.to(sprite, {
        duration: 0.25,
        rotation: 0,
      });
    });

    _setEvent(this, "pointerdown", () => {
      sprite.alpha = 0.5;
    });

    _setEvent(this, "pointerup", () => {
      onClick();
    });
  }
}
