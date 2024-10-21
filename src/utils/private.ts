/**
 * @description 项目私有方法
 */

import { Assets, type AssetsBundle } from "pixi.js";

import { _promiseTimeout } from "./tool";

interface LoadAllBundlesParams {
  gameManifest: AssetsBundle["assets"];
  onEnterGame: () => Promise<void>;
  onProgress: (progress: number) => void;
  onLoadIframeFinish?: () => void;
}

/** @description 加载所有模块
 * @param gameManifest 游戏资源清单
 * @param enterGame 游戏入口协议
 * @param onProgress 进度回调函数
 */
export const loadAllBundles = async (params: LoadAllBundlesParams) => {
  const { gameManifest, onEnterGame, onProgress, onLoadIframeFinish } = params;

  //@ts-ignore
  window.gameLoadedResolve();
  //@ts-ignore
  window.completeLoading();
  //@ts-ignore
  await Promise.all([window.spinePlayedPromise, window.gameLoadedPromise]);
  await _promiseTimeout(1000);
  //@ts-ignore
  document.querySelector(".container").remove();
  //@ts-ignore
  document.querySelector("#app").style.display = "block";
  onLoadIframeFinish?.();

  Assets.addBundle("gameManifest", gameManifest);

  await Assets.loadBundle("gameManifest", async (progress) => {
    if (progress === 1) {
      await onEnterGame();
      onProgress(progress);
    } else {
      onProgress(progress);
    }
  });
};
