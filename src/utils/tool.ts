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
 * @param nums 数字数组
 * @param operators 运算符数组
 * @param point 精度，默认为2
 */
export const _decimal = (nums: number[], operators: ("+" | "-" | "*" | "/")[], point = 2) => {
  //检查数字数量与运算符数量是否匹配
  if (nums.length !== operators.length + 1) {
    throw new Error("数字数量与符号数量不匹配，符号数量＝数字数量-1");
  }

  //初始化结果为第一个数字
  let result = new Decimal(nums[0]);

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

  //循环计算每个运算符对应的数字
  for (let i = 0; i < operators.length; i++) {
    const operand = new Decimal(nums[i + 1]); //获取下一个数字作为操作数
    const operator = operators[i]; //获取当前运算符
    result = calc[operator](result, operand); //使用对应的计算函数进行计算
  }

  return Number(result.toFixed(point));
};

/** @description 角度转弧度 */
export const _degToRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * @description 判断当前移动方向（包含对角方向）
 * @param currentX - 当前 X 坐标
 * @param currentY - 当前 Y 坐标
 * @param targetX - 目标 X 坐标
 * @param targetY - 目标 Y 坐标
 * @returns 返回移动方向的字符串
 */
export const _getMovementDirectionWithDiagonals = (
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number,
) => {
  // 计算角度 (弧度转为度数)
  const radians = Math.atan2(targetY - currentY, targetX - currentX);
  const angle = (radians * 180) / Math.PI;

  // 确保角度在 0 ~ 360 范围内
  const normalizedAngle = (angle + 360) % 360;

  // 判定方向范围
  if ((normalizedAngle >= 337.5 && normalizedAngle <= 360) || normalizedAngle < 22.5) {
    return "right"; // 右
  } else if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) {
    return "rightDown"; // 右下
  } else if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) {
    return "down"; // 下
  } else if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) {
    return "leftDown"; // 左下
  } else if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) {
    return "left"; // 左
  } else if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) {
    return "leftUp"; // 左上
  } else if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) {
    return "up"; // 上
  } else if (normalizedAngle >= 292.5 && normalizedAngle < 337.5) {
    return "rightUp"; // 右上
  }

  return "unknown"; // 无法判定方向
};

/**
 * @description 判断当前移动方向（只判断上下左右）
 * @param currentX - 当前 X 坐标
 * @param currentY - 当前 Y 坐标
 * @param targetX - 目标 X 坐标
 * @param targetY - 目标 Y 坐标
 * @returns 返回移动方向的字符串
 */
export const _getVerticalHorizontalDirection = (
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number,
) => {
  const deltaX = targetX - currentX;
  const deltaY = targetY - currentY;

  // 判断水平方向
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > 0) {
      return "right"; // 右
    } else {
      return "left"; // 左
    }
  } else {
    // 判断垂直方向
    if (deltaY < 0) {
      return "up"; // 上
    } else {
      return "down"; // 下
    }
  }
};
