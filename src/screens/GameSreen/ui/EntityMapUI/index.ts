import { Graphics } from "pixi.js";

import { MapUI } from "../MapUI";

import type { LibImgSprite } from "@/ui/other/LibImgSprite";
import { LibContainerSize } from "@/ui/other/LibContainerSize";

/** @description 实体地图，用于放置物体的地图 */
export class EntityMapUI extends LibContainerSize {
  /** 障碍物 */
  obstacles: Graphics[] = [];

  constructor() {
    super(MapUI.MAP_SIZE.width, MapUI.MAP_SIZE.height);
  }

  /** @description 碰撞检测：AABB */
  testForAABB(object1: LibImgSprite, object2: Graphics): boolean {
    const bounds1 = object1.getBounds();
    const bounds2 = object2.getBounds();

    return (
      bounds1.x < bounds2.x + bounds2.width &&
      bounds1.x + bounds1.width > bounds2.x &&
      bounds1.y < bounds2.y + bounds2.height &&
      bounds1.y + bounds1.height > bounds2.y
    );
  }

  /** @description 碰撞解决：限制玩家移动 */
  resolveCollision(player: LibImgSprite, obstacle: Graphics) {
    const playerBounds = player.getBounds();
    const obstacleBounds = obstacle.getBounds();

    const overlapX = Math.min(
      playerBounds.x + playerBounds.width - obstacleBounds.x,
      obstacleBounds.x + obstacleBounds.width - playerBounds.x,
    );
    const overlapY = Math.min(
      playerBounds.y + playerBounds.height - obstacleBounds.y,
      obstacleBounds.y + obstacleBounds.height - playerBounds.y,
    );

    // 根据重叠的方向限制玩家移动
    if (overlapX < overlapY) {
      if (playerBounds.x < obstacleBounds.x) {
        player.x -= overlapX; // 从左侧碰撞
      } else {
        player.x += overlapX; // 从右侧碰撞
      }
    } else {
      if (playerBounds.y < obstacleBounds.y) {
        player.y -= overlapY; // 从上方碰撞
      } else {
        player.y += overlapY; // 从下方碰撞
      }
    }
  }

  /** @description 追加障碍物 */
  addObstacle(obstacle: Graphics) {
    this.obstacles.push(obstacle);
    this.addChild(obstacle);
  }
}
