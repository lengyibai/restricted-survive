import mitt from "mitt";

type EventData = {
  /** 显示全屏loading */
  "show-full-loading": boolean;
};

type MittEventMap = {
  [key in keyof EventData]: EventData[key];
};

const $globalBus = mitt<MittEventMap>();

export { $globalBus };
