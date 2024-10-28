import { Assets, Container, type Resource, type Texture } from "pixi.js";

import { MapUI } from "../MapUI";

import {
  _generateFrames,
  _resolveCollision,
  _SpriteAnimate,
  _trigger100Times,
} from "@/utils/pixiTool";
import { mapStore } from "@/store/map";

/** @description 玩家 */
export class PlayerUI extends Container {
  /** 当前速度，米/秒，默认为4 */
  static readonly SPEED = 10;
  /** 玩家大小 */
  static readonly SIZE = {
    width: 50,
    height: 50,
  };
  /** 动画 */
  private animate: _SpriteAnimate;
  /** 动画组 */
  private animations: Texture<Resource>[][];
  /** 按下不同方向键时，控制玩家移动方向状态 */
  private playerMoveDirection: Record<string, boolean> = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  constructor() {
    super();

    this.animations = _generateFrames({
      texture: Assets.get("player"),
      width: 45,
      height: 45,
      col: 4,
      row: 4,
    });

    // 创建动画精灵
    this.animate = new _SpriteAnimate(this.animations[0], PlayerUI.SPEED);
    this.addChild(this.animate);
    this.animate.play();

    //摄像头跟随玩家移动
    _trigger100Times(() => {
      //键盘移动玩家
      const px = PlayerUI.getMovePixel();
      if (this.playerMoveDirection.left) this.x -= px;
      if (this.playerMoveDirection.right) this.x += px;
      if (this.playerMoveDirection.up) this.y -= px;
      if (this.playerMoveDirection.down) this.y += px;

      //玩家、实体、地图碰撞处理
      this.handlePlayerCollision();
      this.handlePlayerMapCollision();
    });
  }

  /** @description 获取玩家在屏幕直角坐标系坐标 */
  getPlayerInScreenCoord() {
    const { x, y } = this.getGlobalPosition();
    const coordX = x - window.innerWidth / 2 + this.width / 2;
    const coordY = window.innerHeight / 2 - y - this.height / 2;
    return { coordX, coordY };
  }

  /** @description 设置移动状态 */
  setMoveDirection(direction: Game.DirectionFour, isMove: boolean) {
    this.playerMoveDirection[direction] = isMove;
  }

  /** @description 处理玩家与障碍物的碰撞 */
  private handlePlayerCollision() {
    //循环地图中所有的障碍物
    for (const obstacle of mapStore.entities) {
      //检测玩家与障碍物的碰撞，并限制玩家的移动
      _resolveCollision(this, obstacle);
    }
  }

  /** @description 处理玩家与地图边界的碰撞 */
  private handlePlayerMapCollision() {
    this.x = Math.max(0, this.x);
    this.x = Math.min(MapUI.MAP_SIZE.width - this.width, this.x);
    this.y = Math.max(0, this.y);
    this.y = Math.min(MapUI.MAP_SIZE.height - this.height, this.y);
  }

  /** @description 移动玩家到指定坐标
   * @param x 地图上点击的坐标
   * @param y 地图上点击的坐标
   */

  /** @description 获取玩家每1毫秒移动的像素 */
  static getMovePixel() {
    return (PlayerUI.SPEED / 10) * 2;
  }
}
