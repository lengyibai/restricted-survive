/**
 * @description 项目私有方法
 */

import { Assets, type AssetsBundle } from "pixi.js";

import { FindWayMapUI } from "@/screens/GameSreen/ui/FindWayMapUI";

interface LoadAllBundlesParams {
  gameManifest: AssetsBundle["assets"];
  onProgress: (progress: number) => void;
}

/** @description 加载所有模块
 * @param gameManifest 游戏资源清单
 * @param enterGame 游戏入口协议
 * @param onProgress 进度回调函数
 */
export const loadAllBundles = async (params: LoadAllBundlesParams) => {
  const { gameManifest, onProgress } = params;
  Assets.addBundle("gameManifest", gameManifest);
  await Assets.loadBundle("gameManifest", async (progress) => {
    if (progress === 1) {
      onProgress(progress);
    } else {
      onProgress(progress);
    }
  });
};

/**
 * @description 将坐标转换为单元格行列坐标
 * @param pixelX - 玩家在地图上的 X 坐标（以像素为单位）
 * @param pixelY - 玩家在地图上的 Y 坐标（以像素为单位）
 * @param cellSize - 每个格子的像素大小
 * @returns 返回网格坐标 { gridX, gridY }
 */
export const _getMapPosToGridCoord = (pixelX: number, pixelY: number) => {
  const x = Math.floor(pixelX / FindWayMapUI.CELL_SIZE);
  const y = Math.floor(pixelY / FindWayMapUI.CELL_SIZE);
  return { x, y };
};
