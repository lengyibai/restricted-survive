import PF from "pathfinding";

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
}

const mapStore = new MapStore();

export { mapStore };
