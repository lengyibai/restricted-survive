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

/** @description 碰撞检测限制移动 */
export const _resolveCollision = (mover: Container, entity: Container) => {
  const moverBounds = mover.getBounds();
  const entityBounds = entity.getBounds();

  //检测是否碰撞到实体左侧
  const left = moverBounds.x + moverBounds.width > entityBounds.x;
  //检测是否碰撞到实体右侧
  const right = moverBounds.x < entityBounds.x + entityBounds.width;
  //检测是否碰撞到实体上方
  const top = moverBounds.y + moverBounds.height > entityBounds.y;
  //检测是否碰撞到实体下方
  const bottom = moverBounds.y < entityBounds.y + entityBounds.height;

  //如果移动元素有一个方向没有与实体碰撞，则不移动
  if (!(left && right && top && bottom)) return;

  //计算移动物体和静止物体碰撞后重叠的距离
  const overlapX = Math.min(
    moverBounds.x + moverBounds.width - entityBounds.x,
    entityBounds.x + entityBounds.width - moverBounds.x,
  );
  const overlapY = Math.min(
    moverBounds.y + moverBounds.height - entityBounds.y,
    entityBounds.y + entityBounds.height - moverBounds.y,
  );

  //如果X的重叠量小于Y，则为x轴碰撞
  if (overlapX < overlapY) {
    //从左侧碰撞
    if (moverBounds.x < entityBounds.x) {
      mover.x -= overlapX;
    }
    //从右侧碰撞
    else {
      mover.x += overlapX;
    }
  } else {
    //从上方碰撞
    if (moverBounds.y < entityBounds.y) {
      mover.y -= overlapY;
    }
    //从下方碰撞
    else {
      mover.y += overlapY;
    }
  }
};
