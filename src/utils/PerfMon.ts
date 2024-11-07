import { TextStyle, Text, Application } from "pixi.js";

export class PerfMon {
  private readonly UPDATE_INTERVAL: number = 500; // 更新间隔为500毫秒
  private _app: Application;
  private _paramTxts: Text[] = [];
  private _nowTime: number = 0;
  private _lastTime: number = 0;

  constructor(app: Application) {
    this._app = app;

    const style = new TextStyle({
      fontFamily: "Arial",
      fontSize: 18,
      fontStyle: "italic",
      fontWeight: "bold",
      fill: ["#ffffff", "#00ff99"], // 渐变色
      stroke: "#4a1850",
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: "#000000",
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
      wordWrap: true,
      wordWrapWidth: 440,
      lineJoin: "round",
    });

    // 只创建一项用于显示帧率的文本
    const fpsText = new Text("", style);
    fpsText.x = 0;
    fpsText.y = 0;
    this._paramTxts.push(fpsText);
    this._app.stage.addChild(fpsText);

    this.show();
  }

  private setFpsInfo(fps: number) {
    this._paramTxts[0].text = `FPS: ${fps.toFixed(2)}`;
  }

  show() {
    this._app.ticker.add(() => {
      this._nowTime = performance.now();

      if (this._nowTime - this._lastTime >= this.UPDATE_INTERVAL) {
        const fps = this._app.ticker.FPS;
        this.setFpsInfo(fps);
        this._lastTime = this._nowTime;
      }
    });
  }
}
