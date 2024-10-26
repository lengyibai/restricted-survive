class PlayStore {
  /** 玩家X坐标 */
  x = 0;
  /** 玩家Y坐标 */
  y = 0;

  constructor() {}

  /** @description 设置玩家当前坐标 */
  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

const playerStore = new PlayStore();

export { playerStore };
