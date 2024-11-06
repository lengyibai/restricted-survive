import PF from "pathfinding";

import { FindWayMapUI } from "@/screens/GameSreen/ui/FindWayMapUI";
import { _getMapPosToGridCoord } from "@/utils/private";
import { _random } from "@/utils/tool";

class MapStore {
  /** 地图X坐标 */
  x = 0;
  /** 地图Y坐标 */
  y = 0;
  /** 当前点击的地图坐标系X坐标 */
  coordX = 0;
  /** 当前点击的地图坐标系Y坐标 */
  coordY = 0;
  /** 寻路网格 */
  grid: PF.Grid;
  /** 寻路实例 */
  finder: PF.BestFirstFinder;
  /** 设置实体列表 */
  entities: any[] = [];

  constructor() {}

  /** @description 设置玩家当前坐标 */
  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /** @description 设置当前点击的地图坐标系坐标 */
  setCoord(x: number, y: number) {
    this.coordX = x;
    this.coordY = y;
  }

  /** @description 设置寻路网格 */
  setGrid(grid: PF.Grid) {
    this.grid = grid;
  }

  /** @description 设置寻路实例 */
  setFinder(finder: PF.BestFirstFinder) {
    this.finder = finder;
  }

  /** @description 设置实体列表 */
  setEntities(entities: any[]) {
    this.entities = entities;
  }

  /** @description 随机获取一个地图上的有效坐标
   * @param position 移动者当前坐标
   */
  getRandomWalkableGrid(position: { x: number; y: number }) {
    const RADIUS = 5;

    //获取移动者所在格子坐标
    const { x: gridX, y: gridY } = _getMapPosToGridCoord(position.x, position.y);
    const data = this.getNearbyGrids(gridX, gridY, RADIUS);

    if (data.length === 0) return;

    const index = _random(0, data.length - 1);
    const { x: targetX, y: targetY } = data[index];
    const x = (targetX + 0.5) * FindWayMapUI.CELL_SIZE;
    const y = (targetY + 0.5) * FindWayMapUI.CELL_SIZE;

    return { x, y };
  }

  /** @description 获取以当前移动者网格坐标为中心，半径范围内的有效网格坐标
   * @param position 移动者当前坐标
   * @param radius 半径范围
   * @returns 返回一个包含网格坐标的数组
   */
  getNearbyGrids(gridX: number, gridY: number, radius: number) {
    // 存储结果的数组
    let nearbyGrids: { x: number; y: number }[] = [];

    for (let i = 0; i < radius * 2; i++) {
      for (let j = 0; j < radius * 2; j++) {
        nearbyGrids.push({ x: gridX - radius + i, y: gridY - radius + j });
      }
    }

    // 过滤掉不在有效范围内的格子
    nearbyGrids = nearbyGrids.filter((grid) => {
      return (
        grid.x >= 0 &&
        grid.x <= this.grid.width &&
        grid.y >= 0 &&
        grid.y <= this.grid.height &&
        this.grid.isWalkableAt(grid.x, grid.y) &&
        FindWayMapUI.calculatePath({ x: gridX, y: gridY }, { x: grid.x, y: grid.y })
      );
    });

    return nearbyGrids;
  }
}

const mapStore = new MapStore();

export { mapStore };
