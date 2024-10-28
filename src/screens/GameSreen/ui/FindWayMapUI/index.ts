import { Graphics } from "pixi.js";
import PF from "pathfinding";

import { MapUI } from "../MapUI";

import { _decimal } from "@/utils/tool";
import { LibContainerSize } from "@/ui/other/LibContainerSize";
import { mapStore } from "@/store/map";

/** @description 寻路地图 */
export class FindWayMapUI extends LibContainerSize {
  /** 单元格的像素大小 */
  static readonly CELL_SIZE = 50;
  /** 网格行列数 */
  private gridSize = 20;

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
    this.gridSize = _decimal(MapUI.MAP_SIZE.width, FindWayMapUI.CELL_SIZE, "/");

    //创建网格
    mapStore.setGrid(new PF.Grid(this.gridSize, this.gridSize));

    //创建网格背景
    this.drawGridBackground();
  }

  /** @description 设置寻路障碍物 */
  addObstacle(x: number, y: number) {
    const { x: gridX, y: gridY } = FindWayMapUI.getMapPosToGridCoord(x, y);
    mapStore.grid.setWalkableAt(gridX, gridY, false);
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
