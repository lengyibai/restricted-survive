import PF from "pathfinding";

import { FindWayMapUI } from "@/screens/GameSreen/ui/FindWayMapUI";
import { _getMapPosToGridCoord } from "@/utils/private";

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
    const radius = 30;
    const { x, y } = position;
    const { x: gridX, y: gridY } = _getMapPosToGridCoord(x, y);
    const gridWidth = this.grid.width;
    const gridHeight = this.grid.height;
    console.log(this.grid);

    let attempts = 0;
    const maxAttempts = 900;

    while (attempts < maxAttempts) {
      // 随机生成目标格子坐标
      const targetX = gridX + Math.floor(Math.random() * (2 * radius + 1)) - radius;
      const targetY = gridY + Math.floor(Math.random() * (2 * radius + 1)) - radius;

      // 确保目标格子在有效范围内
      if (
        targetX >= 0 &&
        targetX <= gridWidth &&
        targetY >= 0 &&
        targetY <= gridHeight &&
        this.grid.isWalkableAt(targetX, targetY) &&
        FindWayMapUI.calculatePath({ x: gridX, y: gridY }, { x: targetX, y: targetY })
      ) {
        const x = (targetX + 0.5) * FindWayMapUI.CELL_SIZE;
        const y = (targetY + 0.5) * FindWayMapUI.CELL_SIZE;
        console.log(targetX, targetY);

        return { x, y };
      }
      attempts++;
    }
    return;
  }
}

const mapStore = new MapStore();

export { mapStore };
