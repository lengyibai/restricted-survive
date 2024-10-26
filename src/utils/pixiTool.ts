import {
  Graphics,
  Ticker,
  type Container,
  type DisplayObjectEvents,
  type FederatedPointerEvent,
} from "pixi.js";

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

/** @description 设置事件 */
export const _setEvent = (
  v: Container,
  eventName: keyof DisplayObjectEvents,
  callback: (event: FederatedPointerEvent) => void,
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

/** @description 每秒触发100次触发不受帧率限制 */
export const _trigger100Times = (callback: () => void) => {
  const INTERVAL = 1;
  let elapsedTime = 0; // 累积时间
  const animateLoop = () => {
    elapsedTime += Ticker.shared.elapsedMS;

    if (elapsedTime >= INTERVAL) {
      callback();
      elapsedTime = 0;
    }
  };
  Ticker.shared.add(animateLoop, this);
};
