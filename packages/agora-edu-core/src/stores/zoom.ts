import { EventEmitter } from "events";
import { ApplianceNames } from "white-web-sdk";

export class ZoomController extends EventEmitter {

  private static readonly syncDuration: number = 200;

  private static readonly dividingRule: ReadonlyArray<number> = Object.freeze(
      [
          0.10737418240000011,
          0.13421772800000012,
          0.16777216000000014,
          0.20971520000000016,
          0.26214400000000015,
          0.3276800000000002,
          0.4096000000000002,
          0.5120000000000001,
          0.6400000000000001,
          0.8,
          1,
          1.26,
          1.5876000000000001,
          2.000376,
          2.5204737600000002,
          3.1757969376000004,
          4.001504141376,
          5.041895218133761,
          6.352787974848539,
          8.00451284830916,
          10,
      ],
  );

  private tempRuleIndex?: number;
  private syncRuleIndexTimer: any = null;
  private zoomScale: number = 0;

  public constructor(zoomScale: number = 0) {
    super();
    this.zoomScale = zoomScale
  }

  private delaySyncRuleIndex(): void {
    if (this.syncRuleIndexTimer !== null) {
      clearTimeout(this.syncRuleIndexTimer);
      this.syncRuleIndexTimer = null;
    }
    this.syncRuleIndexTimer = setTimeout(() => {
      this.syncRuleIndexTimer = null;
      this.tempRuleIndex = undefined;
    }, ZoomController.syncDuration);
  }

  private static readRuleIndexByScale(scale: number): number {
      const { dividingRule } = ZoomController;

      if (scale < dividingRule[0]) {
          return 0;
      }
      for (let i = 0; i < dividingRule.length; ++i) {
          const prePoint = dividingRule[i - 1];
          const point = dividingRule[i];
          const nextPoint = dividingRule[i + 1];

          const begin = prePoint === undefined ? Number.MIN_SAFE_INTEGER : (prePoint + point) / 2;
          const end = nextPoint === undefined ? Number.MAX_SAFE_INTEGER : (nextPoint + point) / 2;

          if (scale >= begin && scale <= end) {
              return i;
          }
      }
      return dividingRule.length - 1;
  }


  protected moveRuleIndex(deltaIndex: number, scale: number): number {
    if (this.tempRuleIndex === undefined) {
        this.tempRuleIndex = ZoomController.readRuleIndexByScale(scale);
    }
    this.tempRuleIndex += deltaIndex;

    if (this.tempRuleIndex > ZoomController.dividingRule.length - 1) {
        this.tempRuleIndex = ZoomController.dividingRule.length - 1;
    } else if (this.tempRuleIndex < 0) {
        this.tempRuleIndex = 0;
    }
    const targetScale = ZoomController.dividingRule[this.tempRuleIndex];

    this.delaySyncRuleIndex();
    return targetScale
  }
}

export const transLineTool = {
  'pen': ApplianceNames.pencil,
  'square': ApplianceNames.rectangle,
  'circle': ApplianceNames.ellipse,
  'line': ApplianceNames.straight,
}

export const transToolBar = {
  'pen': ApplianceNames.pencil,
  'square': ApplianceNames.rectangle,
  'circle': ApplianceNames.ellipse,
  'line': ApplianceNames.straight,
  'selection': ApplianceNames.selector,
  'text': ApplianceNames.text,
  'hand': ApplianceNames.hand,
  'eraser': ApplianceNames.eraser,
  // 'color': 'color',
  //  TODO: 'laserPoint icon' need import
  'laserPointer': ApplianceNames.laserPointer,
  // 'blank-page': 'new-page',
  // 'cloud': 'cloud',
  // 'follow': 'follow',
  // 'tools': 'tools'
}

export const mapToolBar: any = {
  [`${ApplianceNames.pencil}`]: 'pen', 
  [`${ApplianceNames.rectangle}`]: 'square',
  [`${ApplianceNames.ellipse}`]: 'circle',
  [`${ApplianceNames.arrow}`]: 'line',
  [`${ApplianceNames.selector}`]: 'selection',
  [`${ApplianceNames.text}`]: 'text',
  [`${ApplianceNames.hand}`]: 'hand',
  [`${ApplianceNames.eraser}`]: 'eraser',
}
