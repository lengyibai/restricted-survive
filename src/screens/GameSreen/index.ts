import { Assets, Graphics, TilingSprite } from "pixi.js";
import gsap from "gsap";

import { PlayerPositionUI } from "./ui/PlayerPositionUI";
import { JoystickUI } from "./ui/JoystickUI";
import { MapUI } from "./ui/MapUI";
import { FindWayMapUI } from "./ui/FindWayMapUI";
import { EntityMapUI } from "./ui/EntityMapUI";
import { PlayerUI } from "./ui/PlayerUI";

import { LibContainerSize } from "@/ui/other/LibContainerSize";
import { _overflowHidden, _setEvent, _trigger100Times } from "@/utils/pixiTool";
import { LibText } from "@/ui/other/LibText";
import { playerStore } from "@/store/player";
import { mapStore } from "@/store/map";

/** @description 游戏世界 */
export class GameSreen extends LibContainerSize {
  /** 当前障碍物坐标组 */
  private obstacleCoord: number[][] = [
    [0, 100],
    [50, 100],
    [100, 100],
    [150, 100],
    [200, 100],
    [250, 100],
    [300, 100],
    [350, 100],
    [400, 100],
    [400, 150],
    [400, 200],
    [400, 250],
    [400, 300],
    [400, 350],
    [350, 350],
    [300, 350],
    [250, 350],
    [200, 350],
    [200, 300],
    [200, 250],
    [200, 200],
    [200, 150],
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
    // this.gameMap.x = -MapUI.MAP_SIZE.width / 2 + window.innerWidth / 2;
    // this.gameMap.y = -MapUI.MAP_SIZE.height / 2 + window.innerHeight / 2;
    mapStore.setPosition(this.gameMap.x, this.gameMap.y);

    //草地
    const grass = new TilingSprite(
      Assets.get("grass"),
      MapUI.MAP_SIZE.width,
      MapUI.MAP_SIZE.height,
    );
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
    // this.player.x = (MapUI.MAP_SIZE.width - this.player.width) / 2;
    // this.player.y = (MapUI.MAP_SIZE.height - this.player.height) / 2;
    this.findWayMap.setTargetPoint(MapUI.MAP_SIZE.width / 2, MapUI.MAP_SIZE.height / 2);

    //摇杆
    this.joystick = new JoystickUI(50);
    this.addChild(this.joystick);
    this.joystick.x = window.innerWidth / 2;
    this.joystick.y = window.innerHeight - this.joystick.height;

    //坐标信息
    this.positionText = new PlayerPositionUI();
    this.addChild(this.positionText);
    this.positionText.y = window.innerHeight - this.positionText.height;

    const tip = new LibText({
      text: "电脑：左键放置障碍物，右键自动移动到目标点，WASD和滑杆控制移动。\n手机：点击放置障碍物，滑杆控制移动。",
      fontSize: 16,
      wordWrap: true,
      wordWrapWidth: window.innerWidth * 0.5,
    });
    this.addChild(tip);

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
      this.handleMapScreenCollision();

      //设置玩家坐标信息handlePlayerMapCollision
      const { x: playerCoordX, y: playerCoordy } = MapUI.posToCoord(
        this.player.x,
        this.player.y,
        PlayerUI.SIZE.width,
        PlayerUI.SIZE.height,
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
        const { x: gridX, y: gridY } = FindWayMapUI.getMapPosToGridCoord(posX, posY);
        this.createObstacle(gridX * FindWayMapUI.CELL_SIZE, gridY * FindWayMapUI.CELL_SIZE);
      }

      //鼠标右键寻路
      if (e.button === 2) {
        this.findWayMap.startFindWay(pageX, pageY);
        mapStore.setCoord(coordX, coordY);
      }
    });

    //键盘事件
    const keys: Record<string, Game.DirectionFour> = {
      KeyW: "up",
      KeyA: "left",
      KeyS: "down",
      KeyD: "right",
    };
    window.addEventListener("keydown", (e) => {
      if (Object.keys(keys).includes(e.code)) {
        this.findWayMap.killPathfindingMove();
        this.player.setMoveDirection(keys[e.code], true);
      }
    });
    window.addEventListener("keyup", (e) => {
      if (Object.keys(keys).includes(e.code)) {
        this.player.setMoveDirection(keys[e.code], false);
      }
    });

    //摇杆事件
    this.joystick.addEvent("move", (dx, dy) => {
      const px = PlayerUI.getMovePixel();
      this.player.x += dx * px;
      this.player.y -= dy * px;
      this.findWayMap.killPathfindingMove();
    });

    //寻路地图事件
    this.findWayMap.setEvent("move", (x, y) => {
      this.player.x += x;
      this.player.y += y;
    });
  }

  /** @description 处理地图边界与屏幕边界的碰撞 */
  private handleMapScreenCollision() {
    //地图目标点
    let x = -this.player.x + window.innerWidth / 2;
    let y = -this.player.y + window.innerHeight / 2;

    //限制地图移动范围
    x = Math.min(x, 0);
    x = Math.max(x, -MapUI.MAP_SIZE.width + window.innerWidth);
    y = Math.min(y, 0);
    y = Math.max(y, -MapUI.MAP_SIZE.height + window.innerHeight);

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
