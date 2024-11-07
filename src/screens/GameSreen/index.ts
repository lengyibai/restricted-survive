import { Assets, Graphics, TilingSprite } from "pixi.js";
import gsap from "gsap";

import { PlayerPositionUI } from "./ui/PlayerPositionUI";
import { JoystickUI } from "./ui/JoystickUI";
import { MapUI } from "./ui/MapUI";
import { FindWayMapUI } from "./ui/FindWayMapUI";
import { EntityMapUI } from "./ui/EntityMapUI";
import { PlayerUI } from "./ui/PlayerUI";

import { LibContainerSize } from "@/ui/other/LibContainerSize";
import { _overflowHidden, _resolveCollision, _setEvent, _trigger100Times } from "@/utils/pixiTool";
import { LibText } from "@/ui/other/LibText";
import { playerStore } from "@/store/player";
import { mapStore } from "@/store/map";
import { _getMapPosToGridCoord } from "@/utils/private";

/** @description 游戏世界 */
export class GameSreen extends LibContainerSize {
  /** 当前障碍物坐标组 */
  private obstacleCoord: number[][] = [
    [930, 900],
    [960, 900],
    [990, 900],
    [990, 930],
    [990, 960],
    [990, 990],
    [960, 990],
    [930, 990],
    [930, 960],
    [900, 900],
    [870, 900],
    [870, 930],
    [870, 960],
    [870, 990],
    [870, 1020],
    [870, 1050],
    [900, 1050],
    [930, 1050],
    [960, 1050],
    [990, 1050],
    [1020, 1050],
    [1050, 1050],
    [1050, 1020],
    [1050, 990],
    [1050, 960],
    [1050, 930],
    [1050, 900],
    [1050, 870],
    [1050, 840],
    [1020, 840],
    [990, 840],
    [930, 840],
    [960, 840],
    [900, 840],
    [870, 840],
    [840, 840],
    [810, 840],
    [810, 870],
    [810, 900],
    [810, 930],
    [810, 960],
    [810, 990],
    [810, 1020],
    [810, 1050],
    [810, 1080],
    [810, 1110],
    [840, 1110],
    [870, 1110],
    [900, 1110],
    [930, 1110],
    [960, 1110],
    [990, 1110],
    [1020, 1110],
    [1050, 1110],
  ];
  /** 地图 */
  private gameMap: MapUI;
  /** 寻路地图 */
  private findWayMap: FindWayMapUI;
  /** 实体地图 */
  private entityMap: EntityMapUI;
  /** 玩家 */
  private player: PlayerUI;
  /** 坐标信息 */
  private positionText: PlayerPositionUI;
  /** 摇杆 */
  private joystick: JoystickUI;

  constructor() {
    super(window.innerWidth, window.innerHeight);
    _overflowHidden(this);

    //地图
    this.gameMap = new MapUI();
    this.addChild(this.gameMap);

    //草地
    const grass = new TilingSprite(Assets.get("grass"), MapUI.MAP_SIZE, MapUI.MAP_SIZE);
    this.gameMap.addChild(grass);
    grass.tileScale.x = 0.5;
    grass.tileScale.y = 0.5;
    grass.alpha = 0.5;

    //寻路地图
    this.findWayMap = new FindWayMapUI();
    this.gameMap.addChild(this.findWayMap);

    //实体地图
    this.entityMap = new EntityMapUI();
    this.gameMap.addChild(this.entityMap);

    //玩家
    this.player = new PlayerUI();
    this.gameMap.addChild(this.player);
    this.player.x = (MapUI.MAP_SIZE - this.player.width) / 2;
    this.player.y = (MapUI.MAP_SIZE - this.player.height) / 2;

    //摇杆
    this.joystick = new JoystickUI(50);
    this.addChild(this.joystick);
    this.joystick.x = window.innerWidth / 2;
    this.joystick.y = window.innerHeight - this.joystick.height;

    //坐标信息
    this.positionText = new PlayerPositionUI();
    this.addChild(this.positionText);
    this.positionText.y = window.innerHeight - this.positionText.height;

    const author = new LibText({
      text: "by 冷弋白",
      fontSize: 16,
    });
    this.addChild(author);
    author.x = window.innerWidth - author.width;
    author.y = window.innerHeight - author.height;

    //设置玩家移动相关事件
    this.setEvent();

    //摄像头跟随玩家移动
    _trigger100Times(() => {
      //玩家、实体、地图碰撞处理
      this.handlePlayerCollision();
      this.handlePlayerMapCollision();
      this.handleMapScreenCollision();

      //设置玩家坐标信息
      const { x: playerCoordX, y: playerCoordy } = MapUI.posToCoord(
        this.player.x,
        this.player.y,
        this.player.width,
        this.player.height,
      );
      this.positionText.setPlayerPosition(playerCoordX, playerCoordy);

      playerStore.setPosition(this.player.x, this.player.y);
      mapStore.setPosition(this.gameMap.x, this.gameMap.y);
    });

    this.obstacleCoord.forEach((coord) => {
      this.createObstacle(coord[0], coord[1]);
    });
  }

  /** @description 设置玩家移动相关事件 */
  private setEvent() {
    //地图事件
    _setEvent(this.gameMap, "pointertap", (e) => {
      const { x: pageX, y: pageY } = e.page;

      //屏幕坐标转地图坐标，给玩家设置
      const posX = Math.abs(this.gameMap.x) + pageX;
      const posY = Math.abs(this.gameMap.y) + pageY;

      //地图坐标转坐标系坐标
      const { x: coordX, y: coordY } = MapUI.posToCoord(posX, posY);

      //鼠标左键放置障碍物
      if (e.button === 0) {
        //将障碍物修正到单元格中
        const { x: gridX, y: gridY } = _getMapPosToGridCoord(posX, posY);
        this.createObstacle(gridX * FindWayMapUI.CELL_SIZE, gridY * FindWayMapUI.CELL_SIZE);
      }

      //鼠标右键寻路
      if (e.button === 2) {
        this.player.startFindWay(posX, posY);
        mapStore.setCoord(coordX, coordY);
      }
    });

    //摇杆事件
    this.joystick.addEvent("move", this.player.joystickMove.bind(this.player));
  }

  /** @description 处理玩家与障碍物的碰撞 */
  private handlePlayerCollision() {
    //循环地图中所有的障碍物
    for (const obstacle of this.entityMap.entities) {
      //检测玩家与障碍物的碰撞，并限制玩家的移动
      _resolveCollision(this.player, obstacle);
    }
  }

  /** @description 处理玩家与地图边界的碰撞 */
  private handlePlayerMapCollision() {
    this.player.x = Math.max(0, this.player.x);
    this.player.x = Math.min(MapUI.MAP_SIZE - this.player.width, this.player.x);
    this.player.y = Math.max(0, this.player.y);
    this.player.y = Math.min(MapUI.MAP_SIZE - this.player.height, this.player.y);
  }

  /** @description 处理地图边界与屏幕边界的碰撞 */
  private handleMapScreenCollision() {
    //地图目标点
    let x = -this.player.x + window.innerWidth / 2;
    let y = -this.player.y + window.innerHeight / 2;

    //限制地图移动范围
    x = Math.min(x, 0);
    x = Math.max(x, -MapUI.MAP_SIZE + window.innerWidth);
    y = Math.min(y, 0);
    y = Math.max(y, -MapUI.MAP_SIZE + window.innerHeight);

    gsap.killTweensOf(this.gameMap);
    gsap.to(this.gameMap, {
      x,
      y,
      duration: 0.5,
      ease: "power1.out",
    });
  }

  /** @description 创建障碍物图形 */
  private createObstacle(x: number, y: number) {
    const obstacle = new Graphics();
    obstacle.beginFill("blue");
    obstacle.drawRect(0, 0, FindWayMapUI.CELL_SIZE, FindWayMapUI.CELL_SIZE);
    obstacle.endFill();

    //设置障碍物位置
    obstacle.x = x;
    obstacle.y = y;

    this.obstacleCoord.push([x, y]);

    //将这些位置标记为不可行走
    this.findWayMap.addObstacle(x, y);
    //将障碍物添加到实体地图中
    this.entityMap.addEntity(obstacle);
  }
}
