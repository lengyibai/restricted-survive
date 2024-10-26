import { Assets, Container } from "pixi.js";

import { GameSreen } from "../GameSreen";

import { gameManifest, loadingManifest } from "@/assets/manifest";
import { loadAllBundles } from "@/utils/private";
import { navigation } from "@/app";

/** @description 加载页 */
export class LoadScreen extends Container {
  constructor() {
    super();

    this.init();
  }

  /** @description 初始化 */
  private async init() {
    const refresh = () => {
      location.reload();
    };
    Assets.addBundle("loadingManifest", loadingManifest);
    await Assets.loadBundle("loadingManifest");

    window.addEventListener("online", refresh);
    await loadAllBundles({
      gameManifest,
      onProgress: (v) => {
        if (v === 1) {
          navigation.showScreen(GameSreen);
        }
      },
    });

    window.removeEventListener("online", refresh);
  }

  resize(w: number, h: number) {}
}
