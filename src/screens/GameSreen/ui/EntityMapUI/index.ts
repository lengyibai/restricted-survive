import { Graphics } from "pixi.js";

import { MapUI } from "../MapUI";

import { LibContainerSize } from "@/ui/other/LibContainerSize";
import { AnimalChicken } from "@/entities/animals/Chicken";

/** @description 实体地图，用于放置物体的地图 */
export class EntityMapUI extends LibContainerSize {
  /** 障碍物 */
  entities: Graphics[] = [];

  constructor() {
    super(MapUI.MAP_SIZE.width, MapUI.MAP_SIZE.height);

    const chicken = new AnimalChicken();
    this.addChild(chicken);
  }

  /** @description 追加障碍物 */
  addEntity(entity: Graphics) {
    this.entities.push(entity);
    this.addChild(entity);
  }
}
