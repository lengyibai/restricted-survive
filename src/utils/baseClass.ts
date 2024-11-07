/**
 * 基类文件
 */

import { Container, Graphics, Ticker, type Resource, type Texture } from "pixi.js";

import type { _SpriteAnimate } from "./pixiTool";
import { _getMapPosToGridCoord } from "./private";
import { _getVHDirection } from "./tool";

import { FindWayMapUI } from "@/screens/GameSreen/ui/FindWayMapUI";
import { mapStore } from "@/store/map";

/** @description 自动寻路 */
export abstract class AutoFindPath extends Container {
  /** 大小 */
  protected abstract size: { width: number; height: number };
  /** 当前速度，米/秒，默认为4 */
  protected abstract speed: number;
  /** 上一次移动的方向 */
  protected abstract lastDirection: Game.DirectionFour | null;
  /** 玩家移动累加回调 */
  protected abstract onMove?: (x: number, y: number) => void;
  /** 动画 */
  protected abstract animate: _SpriteAnimate;
  /** 动画组 */
  protected abstract animations: Texture<Resource>[][];
  /** 计算得到的路径 */
  private path: number[][];
  /** 用于绘制路径的图形 */
  private pathGraphics: Graphics;
  /** 寻路移动函数 */
  private pathfindingMove?: () => void;

  constructor() {
    super();

    //创建路径图形
    this.pathGraphics = new Graphics();
  }

  /** @description 开始寻路
   * @param x 地图坐标X
   * @param y 地图坐标Y
   */
  async startFindWay(x: number, y: number) {
    const { x: centerX, y: centerY } = this.getCenterPoint();
    const moverGridCoord = _getMapPosToGridCoord(centerX, centerY);
    const targetGridCoord = _getMapPosToGridCoord(x, y);

    //检查目标点周围的格子是否有障碍物，如果有障碍物，将目标点调整为其中心点
    if (this.hasObstacleAround(targetGridCoord.x, targetGridCoord.y)) {
      const { x: centerX, y: centerY } = FindWayMapUI.getGridCoordToMapPos(
        targetGridCoord.x,
        targetGridCoord.y,
      );
      x = centerX;
      y = centerY;
    }

    //计算从玩家到目标的路径
    this.path = FindWayMapUI.calculatePath(moverGridCoord, targetGridCoord);
    this.killPathfindingMove();
    this.drawPath(this.path, x, y);
    await this.startMove(x, y);
  }

  /** @description 玩家沿路径移动的逻辑
   * @param x 地图上点击的坐标
   * @param y 地图上点击的坐标
   */
  protected startMove(x: number, y: number) {
    return new Promise<void>((resolve) => {
      //忽略第一个路径点，因为玩家坐标已经在第一个路径点处
      let pathIndex = 1;

      const pixel = this.getMovePixel();

      this.pathfindingMove = () => {
        if (pathIndex < this.path.length) {
          //获取下一个路径点目标点
          const nextPoint = this.path[pathIndex];

          let targetX = nextPoint[0] * FindWayMapUI.CELL_SIZE;
          let targetY = nextPoint[1] * FindWayMapUI.CELL_SIZE;

          //由于寻路结束会停留在单元格中心点，所以需要将最后一个路径终点设置为实际终点
          if (pathIndex === this.path.length - 1) {
            targetX = x - this.size.width / 2;
            targetY = y - this.size.height / 2;
          }

          //计算当前路径点与玩家的直线距离
          const dx = targetX - this.x;
          const dy = targetY - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          //到达路径点后，移动到下一个路径点
          if (distance <= 3) {
            pathIndex++;
          } else {
            const moveX = (dx / distance) * pixel;
            const moveY = (dy / distance) * pixel;

            this.x += moveX;
            this.y += moveY;

            const direction = _getVHDirection(this.x, this.y, targetX, targetY);
            this.turnDirection(direction);
          }
        } else {
          this.killPathfindingMove();
          this.resetDirection();
          resolve();
        }
      };

      Ticker.shared.add(this.pathfindingMove);
    });
  }

  /** @description 中断自动寻路移动 */
  protected killPathfindingMove() {
    this.pathGraphics.clear();
    this.pathfindingMove && Ticker.shared.remove(this.pathfindingMove);
    this.pathfindingMove = undefined;
  }

  /** @description 获取玩家每1毫秒移动的像素 */
  protected getMovePixel() {
    return (this.speed / 10) * 2;
  }

  /** @description 通过传入的角度计算玩家朝向
   * @param angle 角度
   */
  protected updatePlayerDirection(angle: number) {
    let direction: Game.DirectionFour = "down";

    if (angle >= -45 && angle < 45) {
      direction = "right";
    } else if (angle >= 45 && angle < 135) {
      direction = "down";
    } else if (angle >= 135 || angle < -135) {
      direction = "left";
    } else {
      direction = "up";
    }

    this.turnDirection(direction);
  }

  /** @description 绘制路径 */
  private drawPath(path: number[][], targetX: number, targetY: number) {
    this.parent?.addChild(this.pathGraphics);
    this.pathGraphics.clear();

    if (path.length > 0) {
      this.pathGraphics.lineStyle(2, "#fff", 0.1);

      for (let i = 0; i < path.length; i++) {
        const point = path[i];
        const { x, y } = FindWayMapUI.getGridCoordToMapPos(point[0], point[1]);

        //路径起点为当前玩家坐标
        if (i === 0) {
          const { x: centerX, y: centerY } = this.getCenterPoint();
          this.pathGraphics.moveTo(centerX, centerY);
        } else if (i === path.length - 1) {
          this.pathGraphics.lineTo(targetX, targetY);
        } else {
          this.pathGraphics.lineTo(x, y);
        }
      }
    }
  }

  /**
   * @description 检查目标点周围是否有障碍物
   * @param targetCoord - 目标单元格行列
   */
  private hasObstacleAround(coordX: number, coordY: number) {
    const directions = [
      { x: 0, y: 1 }, //下
      { x: 0, y: -1 }, //上
      { x: 1, y: 0 }, //右
      { x: -1, y: 0 }, //左
      { x: -1, y: -1 }, //左上
      { x: -1, y: 1 }, //左下
      { x: 1, y: -1 }, //右上
      { x: 1, y: 1 }, //右下
    ];

    for (const dir of directions) {
      const neighborX = coordX + dir.x;
      const neighborY = coordY + dir.y;

      //确保邻近格子在有效范围内
      if (!mapStore.grid.isWalkableAt(neighborX, neighborY)) {
        return true;
      }
    }

    return false;
  }

  /** @description 获取移动者中心点坐标 */
  protected getCenterPoint() {
    return {
      x: this.x + this.size.width / 2,
      y: this.y + this.size.height / 2,
    };
  }

  /** @description 设置转向 */
  protected abstract turnDirection(direction: Game.DirectionFour): void;

  /** @description 重置转向 */
  protected abstract resetDirection(): void;
}
