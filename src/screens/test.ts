import { Container, Graphics } from "pixi.js";
import PF, { AStarFinder } from "pathfinding";

/** @description 测试类 */
export class TestUI extends Container {
  private grid: PF.Grid; // 网格，用于寻路
  private finder: PF.AStarFinder; // A* 寻路算法实例
  private player: Graphics; // 玩家图形
  private target: Graphics; // 目标图形
  private obstacles: Graphics[] = []; // 存储障碍物的图形
  private path: number[][]; // 存储计算得到的路径
  private cellSize: number = 30; // 每个单元格的像素大小
  private gridSize: number = 20; // 网格的行列数
  private speed: number = 2; // 玩家移动速度

  constructor() {
    super();

    // 创建网格
    this.grid = new PF.Grid(this.gridSize, this.gridSize);

    // 标记一些障碍物
    this.markObstacles();

    // 创建寻路实例
    this.finder = new PF.BestFirstFinder({
      //@ts-ignore
      allowDiagonal: true,
      dontCrossCorners: true,
    });

    // 玩家起始位置
    const playerPosition = { x: 0, y: 0 };

    // 目标位置
    const targetPosition = { x: 10, y: 10 };

    // 计算从玩家到目标的路径
    this.path = this.calculatePath(playerPosition, targetPosition);

    // 创建玩家和目标的显示图形
    this.player = this.createPlayer(playerPosition);
    this.target = this.createTarget(targetPosition);

    // 将障碍物、玩家和目标添加到容器中
    this.addChild(...this.obstacles); // 添加所有障碍物
    this.addChild(this.player); // 添加玩家
    this.addChild(this.target); // 添加目标

    // 开始移动玩家
    this.movePlayer();
  }

  // 标记障碍物并绘制
  private markObstacles(): void {
    // 障碍物位置数组
    const obstaclePositions = [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
      { x: 6, y: 5 },
    ];

    // 遍历障碍物位置
    for (const pos of obstaclePositions) {
      // 将这些位置标记为不可行走
      this.grid.setWalkableAt(pos.x, pos.y, false);
      // 创建并添加障碍物图形
      this.obstacles.push(this.createObstacle(pos));
    }
  }

  // 创建障碍物图形
  private createObstacle(position: { x: number; y: number }): Graphics {
    const obstacle = new Graphics();
    obstacle.beginFill(0x0000ff); // 设置障碍物颜色为蓝色
    obstacle.drawRect(0, 0, this.cellSize, this.cellSize); // 绘制矩形
    obstacle.endFill();
    // 设置障碍物位置
    obstacle.x = position.x * this.cellSize;
    obstacle.y = position.y * this.cellSize;
    return obstacle; // 返回障碍物图形
  }

  // 计算从起点到终点的路径
  private calculatePath(
    start: { x: number; y: number },
    end: { x: number; y: number }
  ): number[][] {
    // 获取起点和终点的节点
    const startNode = this.grid.getNodeAt(start.x, start.y);
    const endNode = this.grid.getNodeAt(end.x, end.y);
    // 使用 A* 算法计算路径
    return this.finder.findPath(
      startNode.x,
      startNode.y,
      endNode.x,
      endNode.y,
      this.grid.clone()
    );
  }

  // 创建玩家图形
  private createPlayer(position: { x: number; y: number }): Graphics {
    const player = new Graphics();
    player.beginFill(0xff0000); // 设置玩家颜色为红色
    player.drawRect(0, 0, this.cellSize, this.cellSize); // 绘制矩形
    player.endFill();
    // 设置玩家位置
    player.x = position.x * this.cellSize;
    player.y = position.y * this.cellSize;
    return player; // 返回玩家图形
  }

  // 创建目标图形
  private createTarget(position: { x: number; y: number }): Graphics {
    const target = new Graphics();
    target.beginFill(0x00ff00); // 设置目标颜色为绿色
    target.drawRect(0, 0, this.cellSize, this.cellSize); // 绘制矩形
    target.endFill();
    // 设置目标位置
    target.x = position.x * this.cellSize;
    target.y = position.y * this.cellSize;
    return target; // 返回目标图形
  }

  // 玩家沿路径移动的逻辑
  private movePlayer(): void {
    let pathIndex = 0; // 路径索引

    // 定义移动函数
    const move = (): void => {
      if (pathIndex < this.path.length) {
        // 如果还有路径点
        const nextPoint = this.path[pathIndex]; // 获取下一个路径点
        const targetX = nextPoint[0] * this.cellSize; // 目标 X 坐标
        const targetY = nextPoint[1] * this.cellSize; // 目标 Y 坐标

        // 计算与目标的距离
        const dx = targetX - this.player.x; // X 方向的距离
        const dy = targetY - this.player.y; // Y 方向的距离
        const distance = Math.sqrt(dx * dx + dy * dy); // 计算实际距离

        // 判断是否到达路径点
        if (distance < 1) {
          // 到达目标
          pathIndex++; // 移动到下一个路径点
        } else {
          // 正常化方向向量并按速度移动
          this.player.x += (dx / distance) * this.speed; // X 轴移动
          this.player.y += (dy / distance) * this.speed; // Y 轴移动
        }

        requestAnimationFrame(move); // 请求下一帧动画
      }
    };

    move(); // 开始移动
  }
}
