import Decimal from "decimal.js";

/** @description 获取两点距离
 * @param startX 起始点x坐标
 * @param endX 终止点x坐标
 * @param startY 起始点y坐标
 * @param endY 终止点y坐标
 */
export const _getStartEndDistance = (
  startX: number,
  endX: number,
  startY: number,
  endY: number,
) => {
  const distance = Math.sqrt(Math.pow(startX - endX, 2) + Math.pow(startY - endY, 2));
  return distance;
};

/** @description 获取点击位置在屏幕直角坐标系坐标系的坐标
 * @param screenX 屏幕x坐标
 * @param screenY 屏幕y坐标
 */
export const _getClickInScreenCoord = (screenX: number, screenY: number) => {
  //基于屏幕直角坐标系坐标系
  const x = screenX - window.innerWidth / 2;
  const y = window.innerHeight / 2 - screenY;
  return { x, y };
};

/** @description 计算x和y轴每次累加移动的步长
 * @param x x轴移动距离
 * @param y y轴移动距离
 */
export const _getMoveStep = (x: number, y: number) => {
  const steps = Math.max(Math.abs(x), Math.abs(y));
  return {
    x: x / steps,
    y: y / steps,
  };
};

/**
 * @description 精确的十进制计算
 * @param num 数字1
 * @param num2 数字2
 * @param operator 运算符数
 * @param point 精度，默认为2
 */
export const _decimal = (
  num1: number,
  num2: number,
  operator: "+" | "-" | "*" | "/",
  point = 2,
) => {
  //初始化结果为第一个数字
  let result = new Decimal(num1);

  //定义计算函数对象，包含加减乘除四则运算
  const calc: Record<string, (a: Decimal, b: Decimal) => Decimal> = {
    "+": (a, b) => a.add(b),
    "-": (a, b) => a.sub(b),
    "*": (a, b) => a.mul(b),
    "/": (a, b) => {
      //检查除数是否为0
      if (b.eq(0)) {
        throw new Error("除数不能为0");
      }
      return a.div(b);
    },
  };
  const operand = new Decimal(num2);
  result = calc[operator](result, operand);
  return Number(result.toFixed(point));
};

/** @description 角度转弧度 */
export const _degToRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * @description 判断当前移动方向（只判断上下左右）
 * @param currentX - 当前 X 坐标
 * @param currentY - 当前 Y 坐标
 * @param targetX - 目标 X 坐标
 * @param targetY - 目标 Y 坐标
 */
export const _getVHDirection = (
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number,
): Game.DirectionFour => {
  const deltaX = targetX - currentX;
  const deltaY = targetY - currentY;

  // 判断是否发生了左右移动
  if (deltaX !== 0 || (deltaX !== 0 && deltaY !== 0)) {
    return deltaX > 0 ? "right" : "left";
  }

  // 判断是否发生了上下移动
  else {
    return deltaY > 0 ? "down" : "up";
  }
};
