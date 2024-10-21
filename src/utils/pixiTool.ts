/**
 * @description Pixi工具类方法
 */

import { DropShadowFilter } from "pixi-filters";
import { Spine } from "pixi-spine";
import {
  Assets,
  BlurFilter,
  ColorMatrixFilter,
  Container,
  Graphics,
  NineSlicePlane,
  type DisplayObjectEvents,
  type FederatedEvent,
  type Texture,
} from "pixi.js";
import _debounce from "lodash/debounce";

import { LibRectBgColor } from "@/ui/other/LibRectBgColor";
import { app } from "@/app";

/** @description 清空容器 */
export const _clearContainerChildren = (container: Container) => {
  // 遍历容器中的所有子对象
  container.removeChildren();
};

/** @description 点击元素外触发 */
export class OutsideClick {
  /** 是否聚焦 */
  isInside = false;
  /** 容器 */
  container!: Container;
  /** 关闭回调 */
  closeCallback!: () => void;

  constructor() {}

  /** @description 设置容器和回调函数 */
  setContainerCallback(container: Container, btn: Container, closeCallback: () => void) {
    this.closeCallback = closeCallback;

    //btn必须通过判断元素可见来控制切换显示：rangeUI.visible = !rangeUI.visible;
    window.addEventListener("pointerdown", (event) => {
      const bounds = container.getBounds();

      this.isInside =
        bounds.contains(event.clientX, event.clientY) ||
        btn.getBounds().contains(event.clientX, event.clientY);

      if (!this.isInside && container.visible) {
        container.visible = false;
        this.closeCallback();
      }
    });
  }
}

interface ShadowConfig {
  color?: string;
  alpha?: number;
  blur?: number;
  distance?: number;
  offset?: { x: number; y: number };
}

/** @description 设置阴影 */
export const _setShadow = (v: any, config?: ShadowConfig) => {
  const {
    color = "#000",
    alpha = 0.25,
    blur = 1,
    distance = 0,
    offset = { x: 0, y: 0 },
  } = config || {};
  const shadowFilter = new DropShadowFilter({
    color: color as unknown as number,
    alpha,
    blur,
    distance,
    offset,
  });
  shadowFilter.resolution = window.devicePixelRatio || 1;
  v.filters = [shadowFilter];
};

/** @description 获取资源缓存 */
export const _getTextureCache = (assets_name: string) => {
  return Assets.get(assets_name);
};

/**
 * 为容器创建并应用一个矩形蒙版，用于隐藏溢出的内容
 * @param container 需要设置蒙版的容器
 */
export const _overflowHidden = (container: Container) => {
  const mask = new Graphics();
  mask.beginFill(0xffffff); // 创建一个白色矩形
  mask.drawRect(0, 0, container.width, container.height);
  mask.endFill();
  container.addChild(mask); // 将蒙版添加到容器
  container.mask = mask; // 设置蒙版
  return mask;
};

/** @description 循环动画
 * @param spineData 骨骼动画数据
 */
export const _animateLoop = (skeleton: any) => {
  const spine = new Spine(skeleton.spineData);
  spine.state.setAnimation(0, "animation", true);
  return spine;
};

/** @description 自定义循环动画间隔
 * @param spineData 骨骼动画数据
 * @param gap 延迟时间ms
 */
export const _animateLoopCustom = (skeleton: any, gap: number) => {
  let timer: NodeJS.Timeout;
  const spine = new Spine(skeleton.spineData);
  spine.state.setAnimation(0, "animation", false);

  /** @description 开启动画 */
  const play = () => {
    timer = setInterval(() => {
      spine.state.setAnimation(0, "animation", false);
    }, gap);
  };

  const stop = () => {
    clearInterval(timer);
  };

  return {
    spine,
    play,
    stop,
  };
};

/** @description 控制动画播放一次 */
export const _animatePlayReset = (skeleton: any) => {
  const { spineData } = skeleton;

  const spine = new Spine(spineData);
  spine.state.setAnimation(0, spineData.animations[0].name, false);
  spine.state.timeScale = 0;

  let completeListener: any;

  return {
    spine,
    play: () => {
      return new Promise<void>((resolve) => {
        spine.state.timeScale = 1;
        spine.state.setAnimation(0, spineData.animations[0].name, false);

        completeListener && spine.state.removeListener(completeListener);
        completeListener = {
          complete: () => {
            resolve();
          },
        };
        spine.state.addListener(completeListener);
      });
    },
    reset: () => {
      spine.state.setAnimation(0, spineData.animations[0].name, false);
      spine.state.timeScale = 0;
    },
  };
};

/** @description 控制动画循环播放 */
export const _animatePlayResetLoop = (skeleton: any) => {
  const { spineData } = skeleton;
  const spine = new Spine(spineData);
  spine.state.setAnimation(0, spineData.animations[0].name, true);
  spine.state.timeScale = 0;

  return {
    spine,
    play: () => {
      spine.state.timeScale = 1;
    },
    reset: () => {
      spine.state.setAnimation(0, spineData.animations[0].name, true);
      spine.state.timeScale = 0;
    },
  };
};

/** @description 组合动画 */
export const _animateSequence = (skeleton: any, animateName: [string, string]) => {
  const spine = new Spine(skeleton.spineData);
  spine.state.setAnimation(0, animateName[0], false);
  spine.state.addAnimation(0, animateName[1], true, 0);
  return spine;
};

/** @description 设置事件 */
export const _setEvent = (
  v: Container,
  eventName: keyof DisplayObjectEvents,
  callback: (event: FederatedEvent) => void,
) => {
  v.cursor = "pointer";
  v.eventMode = "static";
  v.on(eventName, callback);
};

/** @description 单个元素居中 */
export const _setCenter = (
  parent: Container,
  item: Container,
  centerType: "x" | "y" | "xy" = "xy",
) => {
  const xy = centerType === "xy";

  if (centerType === "x" || xy) {
    item.x = parent.width / 2 - item.width / 2;
  }

  if (centerType === "y" || xy) {
    item.y = parent.height / 2 - item.height / 2;
  }
};

/** @description 单个元素轴心居中
 * @param item 元素
 * @param center 轴心坐标
 */
export const _setCenterPivot = (item: Container, center: number[]) => {
  item.x = item.pivot.x = center[0];
  item.y = item.pivot.y = center[1];
};

/**
 * @description 将元素按照指定的列数和间隔排列成网格布局。
 * @param items 要排列的元素数组。
 * @param gap 每个元素之间的间隔。
 * @param cols 网格的列数，默认为元素数量。
 */
export const _arrangeGrid = (items: Container[], gap: number, cols = items.length) => {
  let lastX = 0;
  const itemWidth = items[0]?.width || 0;
  const itemHeight = items[0]?.height || 0;

  items.forEach((item, index) => {
    const colIndex = index % cols;
    const rowIndex = Math.floor(index / cols);

    item.x = colIndex === 0 ? 0 : lastX + gap;
    item.y = rowIndex * (itemHeight + gap);

    lastX = item.x + itemWidth;

    if (colIndex === cols - 1) {
      lastX = 0;
    }
  });
};

/**
 * @description 按照指定方向（水平或垂直）排列元素，支持固定间隔或自定义每个间隔。
 * @param items 要排列的元素数组。
 * @param gap 元素之间的间隔，可以是固定间隔或自定义的间隔数组。
 * @param direction 排列方向，"x"表示水平，"y"表示垂直，默认为水平。
 */
export const _arrangeLinear = (
  items: Container[],
  gap: number | number[],
  direction: "x" | "y" = "x",
) => {
  if (Array.isArray(gap)) {
    if (gap.length !== items.length - 1) {
      console.error(new Error("间隔的数组长度只能等于元素数组长度-1"));
      return;
    }
  }
  let lastPosition = 0;
  items.forEach((item, index) => {
    const position = index === 0 ? 0 : lastPosition + (Array.isArray(gap) ? gap[index - 1] : gap);

    if (direction === "x") {
      item.x = position;
      lastPosition = item.x + item.width;
    } else {
      item.y = position;
      lastPosition = item.y + item.height;
    }
  });
};

/** @description 列表居中
 * @param parent 父容器
 * @param items 子元素数组
 * @param direction 方向数组，"x"表示水平，"y"表示垂直
 */
export const _listCenter = (parent: Container, items: Container[], direction: ("x" | "y")[]) => {
  items.forEach((item) => {
    direction.forEach((d) => {
      item[d] =
        parent[d === "x" ? "width" : "height"] / 2 - item[d === "x" ? "width" : "height"] / 2;
    });
  });
};

/** @description 元素设置背景 */
export const _setBackground = (container: Container) => {
  const bg = new LibRectBgColor({
    width: container.width,
    height: container.height,
    bgColor: "#fff",
  });
  bg.alpha = 0.25;
  container.addChildAt(bg, 0);
};

/** @description 设置九宫格 */
export const _setNineGrid = (params: {
  textrue: Texture;
  dotWidth: number | [number, number, number, number];
  width: number;
  height: number;
}) => {
  const { textrue, dotWidth, width, height } = params;

  let slice_width: number[] = [];

  // 四个角的宽度
  if (Array.isArray(dotWidth)) {
    slice_width = dotWidth;
  } else {
    slice_width = [dotWidth, dotWidth, dotWidth, dotWidth];
  }

  const nineSlicePlane = new NineSlicePlane(
    textrue,
    slice_width[0],
    slice_width[1],
    slice_width[2],
    slice_width[3],
  );
  nineSlicePlane.width = width;
  nineSlicePlane.height = height;

  return nineSlicePlane;
};

/** @description 设置滤镜 */
// 函数重载声明
export function _setFilter(filterName: "brightness", v: number): ColorMatrixFilter;
export function _setFilter(filterName: "blur"): BlurFilter;
export function _setFilter(
  filterName: "brightness" | "blur",
  v?: number,
): ColorMatrixFilter | BlurFilter {
  if (filterName === "brightness") {
    const filter = new ColorMatrixFilter();
    filter.brightness(v!, false);
    filter.resolution = window.devicePixelRatio || 1;
    return filter;
  } else if (filterName === "blur") {
    const filter = new BlurFilter();
    filter.resolution = window.devicePixelRatio || 1;
    return filter;
  }

  throw new Error("未知路径名称");
}

/** @description 文字超过指定宽度就缩放 */
export function _scaleText(text: Container, maxWidth: number): void {
  // 检查文本宽度并缩放
  if (text.width > maxWidth) {
    const scale = maxWidth / text.width; // 计算缩放比例
    text.scale.set(scale); // 应用缩放
  }
}

/** @description 获取横竖屏缩放比例 */
class HorizontalVerticalScale {
  verticalScreenInfo = {
    width: 0,
    height: 0,
    scale: 1,
  };

  horizontalScreenInfo = {
    width: 0,
    height: 0,
    scale: 1,
  };

  constructor() {
    this.updateViewSize();
    window.addEventListener("resize", _debounce(this.updateViewSize, 250));
  }

  private updateViewSize = () => {
    const width = app.screen.width;
    const height = app.screen.height;
    const isPortrait = width < height;

    this.horizontalScreenInfo.width = width;
    this.horizontalScreenInfo.height = height;
    this.horizontalScreenInfo.scale = Math.min(width / 1920, height / 1080);

    this.verticalScreenInfo.width = width;
    this.verticalScreenInfo.height = height;
    this.verticalScreenInfo.scale = isPortrait ? width / 1080 : height / 1080;
  };
}
export const _horizontalVerticalScale = new HorizontalVerticalScale();
