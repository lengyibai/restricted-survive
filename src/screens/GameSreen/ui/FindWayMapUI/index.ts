import { Graphics, Ticker } from "pixi.js";
import PF from "pathfinding";

import { MapUI } from "../MapUI";
import { PlayerUI } from "../PlayerUI";

import { _decimal } from "@/utils/tool";
import { LibContainerSize } from "@/ui/other/LibContainerSize";
import { playerStore } from "@/store/player";
import { mapStore } from "@/store/map";

/** @description 寻路地图 */
export class FindWayMapUI extends LibContainerSize {
  /** 单元格的像素大小 */
  static readonly CELL_SIZE = 50;
  /** 用于绘制路径的图形 */
  private pathGraphics: Graphics;
  /** 计算得到的路径 */
  private path: number[][];
  /** 网格行列数 */
  private gridSize = 20;
  /** 目标点 */
  private targetPoint: LibContainerSize;
  /** 寻路移动函数 */
  private pathfindingMove?: () => void;
  /** 玩家移动累加回调 */
  private playerMove?: (x: number, y: number) => void;

  constructor() {
    super(MapUI.MAP_SIZE.width, MapUI.MAP_SIZE.height);

    //创建寻路实例
    mapStore.setFinder(
      new PF.BestFirstFinder({
        //@ts-ignore
        allowDiagonal: true,
        dontCrossCorners: true,
      }),
    );

    //网格行列数
    this.gridSize = _decimal([MapUI.MAP_SIZE.width, FindWayMapUI.CELL_SIZE], ["/"]);

    //创建网格
    mapStore.setGrid(new PF.Grid(this.gridSize, this.gridSize));

    //创建网格背景
    this.drawGridBackground();

    //创建路径图形
    this.pathGraphics = new Graphics();
    this.addChild(this.pathGraphics);

    //目标点
    this.targetPoint = new LibContainerSize(10, 10, "#fff");
    this.addChild(this.targetPoint);
  }

  /** @description 注册事件 */
  setEvent(eventName: "move", callback: (x: number, y: number) => void): void;
  setEvent(eventName: "move", callback: (x: number, y: number) => void): void {
    if (eventName === "move") {
      this.playerMove = callback;
    }
  }

  /** @description 设置寻路障碍物 */
  addObstacle(x: number, y: number) {
    const { x: gridX, y: gridY } = FindWayMapUI.getMapPosToGridCoord(x, y);
    mapStore.grid.setWalkableAt(gridX, gridY, false);
  }

  /** @description 设置寻路终点坐标 */
  setTargetPoint(x: number, y: number) {
    this.targetPoint.x = x - this.targetPoint.width / 2;
    this.targetPoint.y = y - this.targetPoint.height / 2;
  }

  /** @description 开始寻路 */
  startFindWay(pageX: number, pageY: number) {
    //屏幕坐标转地图坐标
    let x = Math.abs(mapStore.x) + pageX;
    let y = Math.abs(mapStore.y) + pageY;

    const playerGridCoord = FindWayMapUI.getMapPosToGridCoord(playerStore.x, playerStore.y);
    const targetGridCoord = FindWayMapUI.getMapPosToGridCoord(x, y);

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
    this.path = FindWayMapUI.calculatePath(playerGridCoord, targetGridCoord);
    this.drawPath(this.path, x, y);
    this.moveGridPlayer(x, y);
    this.setTargetPoint(x, y);
  }

  /** @description 中断自动寻路移动 */
  killPathfindingMove(clearPath = true) {
    this.pathfindingMove && Ticker.shared.remove(this.pathfindingMove);
    this.pathfindingMove = undefined;
    clearPath && this.pathGraphics.clear();

    this.setTargetPoint(playerStore.x, playerStore.y);
    this.targetPoint.visible = false;
  }

  /** @description 绘制路径 */
  private drawPath(path: number[][], targetX: number, targetY: number) {
    this.pathGraphics.clear();

    if (path.length > 0) {
      this.pathGraphics.lineStyle(2, "#fff", 0.1);

      for (let i = 0; i < path.length; i++) {
        const point = path[i];
        const { x, y } = FindWayMapUI.getGridCoordToMapPos(point[0], point[1]);

        //路径起点为当前玩家坐标
        if (i === 0) {
          this.pathGraphics.moveTo(
            playerStore.x + PlayerUI.SIZE.width / 2,
            playerStore.y + PlayerUI.SIZE.height / 2,
          );
        } else if (i === path.length - 1) {
          this.pathGraphics.lineTo(targetX, targetY);
        } else {
          this.pathGraphics.lineTo(x, y);
        }
      }
    }
  }

  /** @description 创建网格背景 */
  private drawGridBackground() {
    const gridGraphics = new Graphics();
    gridGraphics.lineStyle(1, "#fff", 0.1);

    for (let x = 0; x < this.gridSize; x++) {
      gridGraphics.moveTo(x * FindWayMapUI.CELL_SIZE, 0);
      gridGraphics.lineTo(x * FindWayMapUI.CELL_SIZE, this.gridSize * FindWayMapUI.CELL_SIZE);
    }

    for (let y = 0; y < this.gridSize; y++) {
      gridGraphics.moveTo(0, y * FindWayMapUI.CELL_SIZE);
      gridGraphics.lineTo(this.gridSize * FindWayMapUI.CELL_SIZE, y * FindWayMapUI.CELL_SIZE);
    }

    this.addChild(gridGraphics);
  }

  /** @description 玩家沿路径移动的逻辑
   * @param x 地图上点击的坐标
   * @param y 地图上点击的坐标
   */
  private moveGridPlayer(x: number, y: number) {
    this.killPathfindingMove(false);
    this.targetPoint.visible = true;

    //忽略第一个路径点，因为玩家坐标已经在第一个路径点处
    let pathIndex = 1;

    const pixel = PlayerUI.getPlayerMovePixel();

    this.pathfindingMove = () => {
      if (pathIndex < this.path.length) {
        //获取下一个路径点目标点
        const nextPoint = this.path[pathIndex];

        let targetX = nextPoint[0] * FindWayMapUI.CELL_SIZE;
        let targetY = nextPoint[1] * FindWayMapUI.CELL_SIZE;

        //由于寻路结束会停留在单元格中心点，所以需要将最后一个路径终点设置为实际终点
        if (pathIndex === this.path.length - 1) {
          targetX = x - PlayerUI.SIZE.width / 2;
          targetY = y - PlayerUI.SIZE.height / 2;
        }

        //计算当前路径点与玩家的直线距离
        const dx = targetX - playerStore.x;
        const dy = targetY - playerStore.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        //到达路径点后，移动到下一个路径点
        if (distance < 1) {
          pathIndex++;
        } else {
          const x = (dx / distance) * pixel;
          const y = (dy / distance) * pixel;
          this.playerMove && this.playerMove(x, y);
        }
      } else {
        this.killPathfindingMove();
      }
    };

    //当路径寻路完成后，将精灵的位置更新为目标位置，避免下一次寻路时先到达中间
    Ticker.shared.add(this.pathfindingMove);
  }

  /**
   * @description 检查目标点周围是否有障碍物
   * @param targetCoord - 目标单元格行列
   */
  private hasObstacleAround(x: number, y: number) {
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
      const neighborX = x + dir.x;
      const neighborY = y + dir.y;

      //确保邻近格子在有效范围内
      if (!mapStore.grid.isWalkableAt(neighborX, neighborY)) {
        return true;
      }
    }

    return false;
  }

  /**
   * @description 将坐标转换为单元格行列坐标
   * @param pixelX - 玩家在地图上的 X 坐标（以像素为单位）
   * @param pixelY - 玩家在地图上的 Y 坐标（以像素为单位）
   * @param cellSize - 每个格子的像素大小
   * @returns 返回网格坐标 { gridX, gridY }
   */
  static getMapPosToGridCoord(pixelX: number, pixelY: number) {
    const x = Math.floor(pixelX / FindWayMapUI.CELL_SIZE);
    const y = Math.floor(pixelY / FindWayMapUI.CELL_SIZE);
    return { x, y };
  }

  /** @description 将单元格行列坐标转位地图坐标 */
  static getGridCoordToMapPos(gridX: number, gridY: number) {
    const x = (gridX + 0.5) * FindWayMapUI.CELL_SIZE;
    const y = (gridY + 0.5) * FindWayMapUI.CELL_SIZE;
    return { x, y };
  }

  /** @description 计算从起点到终点的路径 */
  static calculatePath(start: { x: number; y: number }, end: { x: number; y: number }): number[][] {
    //获取起点和终点的节点
    const startNode = mapStore.grid.getNodeAt(start.x, start.y);
    const endNode = mapStore.grid.getNodeAt(end.x, end.y);
    //使用 A* 算法计算路径
    return mapStore.finder.findPath(
      startNode.x,
      startNode.y,
      endNode.x,
      endNode.y,
      mapStore.grid.clone(),
    );
  }
}
