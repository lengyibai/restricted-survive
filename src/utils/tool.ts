/**
 * @description 公共工具函数
 */

import Decimal from "decimal.js";

/** @description 判断是否为移动端，不包含平板 */
export const _isPhone = (() => {
  const width = screen.width;
  const height = screen.height;
  const aspectRatio = width > height ? width / height : height / width;

  const isPad = aspectRatio > 1 && aspectRatio < 1.7;
  return /mobile|Android|iPhone/i.test(navigator.userAgent) && !isPad;
})();
// export const _isPhone = true;

/** @description 是否为平板 */
export const _isPad = (() => {
  const width = screen.width;
  const height = screen.height;
  const aspectRatio = width > height ? width / height : height / width;
  const isPad = aspectRatio > 1 && aspectRatio < 1.7;
  return isPad;
})();

/** @description Promise定时器
 * @param delay 延迟时间
 * @param fn 延迟后执行的函数
 */
export const _promiseTimeout = (delay = 1, fn?: () => void) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      fn?.();
      resolve();
    }, delay);
  });
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

/** @description 随机数
 * @param min 最小值
 * @param max 最大值
 * @param num 保留小数位数
 */
export const _random = (min: number, max: number, num = 0) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(num));
};

/** @description 随机生成10个不重复的1-40的数字 */
export const _getUniqueRandomNumbers = (min = 1, max = 40, count = 10) => {
  // 创建一个包含 1-40 的数字数组
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  // 随机洗牌数组
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  // 返回前 count 个元素
  return numbers.slice(0, count);
};

/** @description console颜色打印
 * @param title 标题
 * @param color 信息
 * @param logs 颜色
 */
export const _colorConsole = (
  title: string,
  color: "red" | "orange" | "yellow" | "green" | "blue" | "purple",
  logs:
    | {
        label: string;
        value: any;
      }[]
    | any = [],
) => {
  if (import.meta.env.VITE_COLOR_CONSOLE === "0") return;

  const colors = {
    red: "#c0392b",
    orange: "#d35400",
    yellow: "#f1c40f",
    green: "#27ae60",
    blue: "#2980b9",
    purple: "#be2edd",
  };

  // 时间戳生成函数
  const getTimestamp = () => {
    const now = new Date();
    const hour = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `[${hour}:${minutes}:${seconds}]`;
  };
  if (Array.isArray(logs)) {
    const v = logs.map((log) => {
      return [`\n${log.label}：`, log.value];
    });
    console.log(
      `%c${getTimestamp()}-${title}`,
      `color: #fff;background: ${colors[color]}; font-size:14px;border-radius:5px;padding:0.25em;margin:0.5em 0`,
      ...v.flat(Infinity),
    );
  } else {
    console.log(
      `%c${getTimestamp()}-${title}`,
      `color: #fff;background: ${colors[color]}; font-size:14px;border-radius:5px;padding:0.25em;margin:0.5em 0`,
      logs,
    );
  }
};

/** @description 获取地址栏参数 */
export const _getPathParams = () => {
  const v = location.href;
  const url = v.split("?")[1];

  if (!url) return {};

  const params =
    url.split("&").reduce((pre: Record<string, string>, cur) => {
      const [k, v] = cur.split(/=(.+)/);
      return (pre[k] = v), pre;
    }, {}) || {};

  return params;
};

/** @description 对象转为url参数 */
export const _customStringify = (params: Record<string, string | number | boolean>) => {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
};

/**
 * @description 格式化数字为千分位。
 * @param num 需要格式化的数字
 * @param retain 保留小数位数
 */
export const _fmtNum = (num: number, retain = 2) => {
  const str = num.toFixed(retain).toString(); // 先将数字保留两位小数并转为字符串
  const reg = str.indexOf(".") > -1 ? /(\d)(?=(\d{3})+\.)/g : /(\d)(?=(?:\d{3})+$)/g;
  return str.replace(reg, "$1,");
};

/** @description 移动数组 */
export const _rotateArray = <T>(arr: T[], step: number): T[] => {
  const length = arr.length;

  // 处理步长为0的情况，直接返回原数组
  if (length === 0 || step % length === 0) return arr;

  // 处理步长，负数转为正数等效的移动步长
  const normalizedStep = ((step % length) + length) % length;

  // 移动数组
  return arr.slice(-normalizedStep).concat(arr.slice(0, -normalizedStep));
};

/** @description 百分比概率触发
 * @param probability 触发概率，0-100
 */
export const _triggerByProbability = (probability: number) => Math.random() * 100 < probability;

/** @description 深度JSON解析 */
export const _deepParse = (json: string) => {
  let result;

  try {
    result = JSON.parse(json);
  } catch (e) {
    return json;
  }

  if (typeof result === "object" && result !== null) {
    for (const key in result) {
      result[key] = _deepParse(result[key]);
    }
  }

  return result;
};

/** @description 角度转弧度 */
export const _degToRad = (deg: number) => (deg * Math.PI) / 180;

/** @description 翻转索引后面的数组
 * @param arr 数组
 * @param index 索引
 */
export function _reverseArrayFromIndex<T>(arr: T[], index: number): T[] {
  if (index < 0 || index >= arr.length) {
    throw new Error("Index out of bounds");
  }
  const subArray = arr.slice(index + 1).reverse();
  return [...arr.slice(0, index + 1), ...subArray];
}

/** @description 可控延迟调用函数 */
export const _controlledDelayedCall = (time: number) => {
  let _resolve: any;
  let timer: NodeJS.Timeout;

  const start = new Promise<void>((resolve) => {
    _resolve = resolve;
    timer = setTimeout(() => {
      resolve();
    }, time);
  });

  const stop = () => {
    clearTimeout(timer);
    _resolve();
  };

  return {
    start,
    stop,
  };
};

/** @description 设置网站标题及图标 */
export const _setTitleIcon = (name: string, url: string) => {
  document.title = name;
  const link = document.createElement("link");
  link.setAttribute("rel", "icon");
  link.setAttribute("href", url);

  const head = document.head || document.getElementsByTagName("head")[0];
  head.appendChild(link);
};

export const createBezierPoints = (
  anchorPoints: { x: number; y: number }[],
  pointsAmount: number,
) => {
  const points = [];
  for (let i = 0; i < pointsAmount; i++) {
    const point = multiPointBezier(anchorPoints, i / pointsAmount);
    points.push(point);
  }
  return points;
};
const multiPointBezier = (points: { x: number; y: number }[], t: number) => {
  const len = points.length;
  let x = 0,
    y = 0;
  const binomial = (start: number, end: number) => {
    let cs = 1,
      bcs = 1;
    while (end > 0) {
      cs *= start;
      bcs *= end;
      start--;
      end--;
    }
    return cs / bcs;
  };
  for (let i = 0; i < len; i++) {
    const point = points[i];
    x += point.x * Math.pow(1 - t, len - 1 - i) * Math.pow(t, i) * binomial(len - 1, i);
    y += point.y * Math.pow(1 - t, len - 1 - i) * Math.pow(t, i) * binomial(len - 1, i);
  }
  return { x: x, y: y };
};
