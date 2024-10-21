import gsap from "gsap";

import { LibText } from "@/ui/other/LibText";
import { LibContainerSize } from "@/ui/other/LibContainerSize";
import { _overflowHidden } from "@/utils/pixiTool";

function getRandomColor() {
  const randomHex = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomHex.padStart(6, "0")}`;
}

/** @description 游戏世界 */
export class GameWorld extends LibContainerSize {
  /** 地面 */
  private ground: LibContainerSize;
  /** 角色 */
  private player: LibContainerSize;

  constructor() {
    super(1920, 1080, "#000");
    _overflowHidden(this);

    //地皮
    this.ground = new LibContainerSize(5000, 5000, "#000");
    this.addChild(this.ground);
    _overflowHidden(this.ground);
    this.ground.x = -5000 / 2 + 1920 / 2;
    this.ground.y = -5000 / 2 + 1080 / 2;

    //测试
    const a = [];
    let lastX = 0;
    for (let i = 0; i < 625; i++) {
      const box = new LibContainerSize(200, 200, getRandomColor());
      box.alpha = 0.5;
      this.ground.addChild(box);
      const text = new LibText({
        text: i + 1,
        fontColor: "#fff",
        fontSize: 30,
      });
      box.addChild(text);
      a.push(box);

      const colIndex = i % 25;
      const rowIndex = Math.floor(i / 25);

      box.x = colIndex === 0 ? 0 : lastX;
      box.y = rowIndex * box.height;

      lastX = box.x + box.width;

      if (colIndex === 25 - 1) {
        lastX = 0;
      }
    }

    this.player = new LibContainerSize(25, 25, "red");
    this.addChild(this.player);
    this.player.x = 1920 / 2 - this.player.width / 2;
    this.player.y = 1080 / 2 - this.player.width / 2;

    this.setKeyDownEvent();
  }

  /** @description 键盘事件 */
  private setKeyDownEvent() {
    //按键状态
    const keysPressed: Record<string, boolean> = {};

    //玩家是否水平居中
    const isPlayerHorizontalCenter = () => {
      return this.player.x === 1920 / 2 - this.player.width / 2;
    };

    //玩家是否垂直居中
    const isPlayerVerticalCenter = () => {
      return this.player.y === 1080 / 2 - this.player.height / 2;
    };

    //移动地面
    const moveGround = (dx: number, dy: number) => {
      if (this.ground.x >= 0 && dx > 0) {
        gsap.killTweensOf(this.ground);
        this.ground.x = 0;
        movePlayer(-50, 0);
        dx = 0;
      }

      if (this.ground.y >= 0 && dy > 0) {
        gsap.killTweensOf(this.ground);
        this.ground.y = 0;
        movePlayer(0, -50);
        dy = 0;
      }

      if (this.ground.x <= -5000 + 1920 && dx < 0) {
        gsap.killTweensOf(this.ground);
        this.ground.x = -5000 + 1920;
        movePlayer(50, 0);
        dx = 0;
      }

      if (this.ground.y <= -5000 + 1080 && dy < 0) {
        gsap.killTweensOf(this.ground);
        this.ground.y = -5000 + 1080;
        movePlayer(0, 50);
        dy = 0;
      }

      // if (!isPlayerHorizontalCenter()) {
      //   dx = 0;
      // }
      // if (!isPlayerVerticalCenter()) {
      //   dy = 0;
      // }

      gsap.to(this.ground, {
        x: `+=${dx}`,
        y: `+=${dy}`,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    //移动角色
    const movePlayer = (dx: number, dy: number) => {
      if (this.player.x <= 0 && dx < 0) {
        this.player.x = 0;
        dx = 0;
      }

      if (this.player.y <= 0 && dy < 0) {
        this.player.y = 0;
        dy = 0;
      }

      if (this.player.x >= 1920 - this.player.width && dx > 0) {
        this.player.x = 1920 - this.player.width;
        dx = 0;
      }

      if (this.player.y >= 1080 - this.player.height && dy > 0) {
        this.player.y = 1080 - this.player.height;
        dy = 0;
      }

      gsap.to(this.player, {
        x: `+=${dx}`,
        y: `+=${dy}`,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    //移动距离
    const movementMap: Record<string, [number, number]> = {
      ArrowRight: [-300, 0],
      ArrowLeft: [300, 0],
      ArrowUp: [0, 300],
      ArrowDown: [0, -300],
    };

    //判断是否有两个方向同时按下
    const isOppositeDirectionPressed = () => {
      const horizontalStop = keysPressed["ArrowLeft"] && keysPressed["ArrowRight"];
      const verticalStop = keysPressed["ArrowUp"] && keysPressed["ArrowDown"];
      return horizontalStop || verticalStop;
    };

    //实时更新移动
    const updateMovement = () => {
      if (!isOppositeDirectionPressed()) {
        for (const key in keysPressed) {
          if (keysPressed[key] && movementMap[key]) {
            const [dx, dy] = movementMap[key];
            moveGround(dx, dy);
          }
        }
      }

      requestAnimationFrame(updateMovement);
    };

    window.addEventListener("keydown", (e) => {
      keysPressed[e.code] = true;
    });

    window.addEventListener("keyup", (e) => {
      keysPressed[e.code] = false;
    });

    updateMovement(); // 启动监听循环
  }

  resize(w: number, h: number) {
    console.log(w, h);
  }
}
