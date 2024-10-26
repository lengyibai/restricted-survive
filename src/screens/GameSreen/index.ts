import { Assets, Graphics, TilingSprite } from "pixi.js";

import { PlayerPositionUI } from "./ui/PlayerPositionUI";
import { JoystickUI } from "./ui/JoystickUI";
import { MapUI } from "./ui/MapUI";
import { FindWayMapUI } from "./ui/FindWayMapUI";
import { entityMap, EntityMapUI } from "./ui/EntityMapUI";
import { PlayerUI } from "./ui/PlayerUI";

import { LibContainerSize } from "@/ui/other/LibContainerSize";
import { _overflowHidden, _setEvent, _trigger100Times } from "@/utils/pixiTool";
import { LibText } from "@/ui/other/LibText";
import { playerStore } from "@/store/player";
import { mapStore } from "@/store/map";

/** @description 游戏世界 */
export class GameSreen extends LibContainerSize {
  /** 当前速度，米/秒，默认为4 */
  static readonly SPPEND = 4;
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
  /** 按下不同方向键时，控制玩家移动方向状态 */
  private playerMoveDirection: Record<string, boolean> = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  constructor() {
    super(window.innerWidth, window.innerHeight);
    _overflowHidden(this);

    //地皮
    this.gameMap = new MapUI();
    this.addChild(this.gameMap);
    this.gameMap.x = -MapUI.MAP_SIZE.width / 2 + window.innerWidth / 2;
    this.gameMap.y = -MapUI.MAP_SIZE.height / 2 + window.innerHeight / 2;

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

    //实体地图
    this.entityMap = new EntityMapUI();
    this.gameMap.addChild(entityMap);

    //寻路地图
    this.findWayMap = new FindWayMapUI();
    this.gameMap.addChild(this.findWayMap);

    //玩家
    this.player = new PlayerUI();
    this.gameMap.addChild(this.player);
    this.player.x = (MapUI.MAP_SIZE.width - this.player.width) / 2;
    this.player.y = (MapUI.MAP_SIZE.height - this.player.height) / 2;
    this.findWayMap.setTargetPoint(MapUI.MAP_SIZE.width / 2, MapUI.MAP_SIZE.height / 2);

    //坐标信息
    this.positionText = new PlayerPositionUI();
    this.addChild(this.positionText);
    this.positionText.y = window.innerHeight - this.positionText.height;

    //摇杆
    this.joystick = new JoystickUI(50);
    this.addChild(this.joystick);
    this.joystick.x = window.innerWidth / 2;
    this.joystick.y = window.innerHeight - this.joystick.height;

    //摄像头跟随玩家移动
    _trigger100Times(() => {
      this.handlePlayerCollision();

      //限制玩家移动范围
      this.player.x = Math.max(0, this.player.x);
      this.player.x = Math.min(MapUI.MAP_SIZE.width - this.player.width, this.player.x);
      this.player.y = Math.max(0, this.player.y);
      this.player.y = Math.min(MapUI.MAP_SIZE.height - this.player.height, this.player.y);
      playerStore.setPosition(this.player.x, this.player.y);

      //设置玩家坐标信息
      const { x: playerCoordX, y: playerCoordy } = MapUI.posToCoord(
        this.player.x,
        this.player.y,
        PlayerUI.SIZE.width,
        PlayerUI.SIZE.height,
      );
      this.positionText.setPlayerPosition(playerCoordX, playerCoordy);

      //地图目标点
      let x = -this.player.x + window.innerWidth / 2;
      let y = -this.player.y + window.innerHeight / 2;

      //限制地图移动范围
      x = Math.min(x, 0);
      x = Math.max(x, -MapUI.MAP_SIZE.width + window.innerWidth);
      y = Math.min(y, 0);
      y = Math.max(y, -MapUI.MAP_SIZE.height + window.innerHeight);

      // gsap.killTweensOf(this.gameMap);
      // gsap.to(this.gameMap, {
      //   x,
      //   y,
      //   duration: 0.5,
      //   ease: "power1.out",
      // });
      this.gameMap.x = x;
      this.gameMap.y = y;
      mapStore.setPosition(this.gameMap.x, this.gameMap.y);
    });

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
  }

  /** @description 设置玩家移动相关事件 */
  private setEvent() {
    //键盘事件按键状态监听
    const keyMovePlayerAndMap = () => {
      const px = PlayerUI.getPlayerMovePixel();
      if (this.playerMoveDirection.left) this.player.x -= px;
      if (this.playerMoveDirection.right) this.player.x += px;
      if (this.playerMoveDirection.up) this.player.y -= px;
      if (this.playerMoveDirection.down) this.player.y += px;
    };
    _trigger100Times(keyMovePlayerAndMap.bind(this));

    //键盘事件
    const keys: Record<string, string> = {
      KeyW: "up",
      KeyA: "left",
      KeyS: "down",
      KeyD: "right",
    };
    window.addEventListener("keydown", (e) => {
      if (Object.keys(keys).includes(e.code)) {
        this.findWayMap.killPathfindingMove();
        this.playerMoveDirection[keys[e.code]] = true;
      }
    });
    window.addEventListener("keyup", (e) => {
      if (Object.keys(keys).includes(e.code)) {
        this.playerMoveDirection[keys[e.code]] = false;
      }
    });

    //摇杆事件
    this.joystick.addEvent("move", (dx, dy) => {
      const px = PlayerUI.getPlayerMovePixel();
      this.player.x += dx * px;
      this.player.y -= dy * px;
      this.findWayMap.killPathfindingMove();
    });

    //地图事件
    _setEvent(this.gameMap, "pointertap", (e) => {
      const { x: pageX, y: pageY } = e.page;

      //屏幕坐标转地图坐标，给玩家设置
      const posX = Math.abs(this.x) + pageX;
      const posY = Math.abs(this.y) + pageY;

      //地图坐标转坐标系坐标
      const { x: coordX, y: coordY } = MapUI.posToCoord(posX, posY);
      mapStore.setCoord(coordX, coordY);

      // if (e.button === 0) {
      //   const targetGridCoord = FindWayMapUI.getGridCoordinates(posX, posY);
      //   this.createObstacle(targetGridCoord);
      // }

      if (e.button === 2) {
        this.findWayMap.startFindWay(pageX, pageY);
      }
    });

    //寻路地图事件
    this.findWayMap.setEvent("move", (x, y) => {
      this.player.x += x;
      this.player.y += y;
    });
  }

  /** @description 处理玩家与障碍物的碰撞 */
  private handlePlayerCollision() {
    for (const obstacle of this.entityMap.obstacles) {
      if (this.entityMap.testForAABB(this.player, obstacle)) {
        // 碰撞检测，限制玩家的移动
        this.entityMap.resolveCollision(this.player, obstacle);
      }
    }
  }

  /** @description 创建障碍物图形 */
  private createObstacle(position: { x: number; y: number }) {
    const obstacle = new Graphics();
    obstacle.beginFill("blue");
    obstacle.drawRect(0, 0, FindWayMapUI.CELL_SIZE, FindWayMapUI.CELL_SIZE);
    obstacle.endFill();

    //设置障碍物位置
    obstacle.x = position.x * FindWayMapUI.CELL_SIZE;
    obstacle.y = position.y * FindWayMapUI.CELL_SIZE;

    //将这些位置标记为不可行走
    this.findWayMap.grid.setWalkableAt(position.x, position.y, false);

    //将障碍物添加到实体地图中
    this.entityMap.addObstacle(obstacle);
  }
}
