class MapStore {
  /** 地图X坐标 */
  x = 0;
  /** 地图Y坐标 */
  y = 0;
  /** 当前点击的地图坐标系X坐标 */
  coordX = 0;
  /** 当前点击的地图坐标系Y坐标 */
  coordY = 0;

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
}

const mapStore = new MapStore();

export { mapStore };
