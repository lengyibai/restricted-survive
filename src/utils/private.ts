/**
 * @description 项目私有方法
 */

import { Assets, type AssetsBundle } from "pixi.js";

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
