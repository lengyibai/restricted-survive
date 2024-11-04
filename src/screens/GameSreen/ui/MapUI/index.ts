import { LibContainerSize } from "@/ui/other/LibContainerSize";

/** @description 地图UI */
export class MapUI extends LibContainerSize {
  /** 地图大小 */
  static readonly MAP_SIZE = 1920;

  constructor() {
    super(MapUI.MAP_SIZE, MapUI.MAP_SIZE);
  }

  /** @description 地图坐标转地图坐标系坐标
   * @param posX 地图上的X坐标
   * @param posY 地图上的Y坐标
   * @param width 元素宽度
   * @param height 元素高度
   */
  static posToCoord(posX: number, posY: number, width = 0, height = 0) {
    const x = posX - MapUI.MAP_SIZE / 2 + width / 2;
    const y = MapUI.MAP_SIZE / 2 - posY - height / 2;
    return { x, y };
  }
}
