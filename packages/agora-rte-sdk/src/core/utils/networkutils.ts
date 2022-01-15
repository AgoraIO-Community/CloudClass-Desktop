import { AGNetworkQuality } from '../..';

export class QualityCalc {
  private quality: AGNetworkQuality = AGNetworkQuality.good;
  private qualities: number[] = [];

  static MAX_QUALITY_NUMBER = 3;

  private _updateQualities(webquality: number) {
    this.qualities.push(webquality);
    this.qualities.length > QualityCalc.MAX_QUALITY_NUMBER && this.qualities.shift();
  }

  private _resetQualities() {
    this.qualities = [];
  }
  toAGQuality(webquality?: number): AGNetworkQuality {
    if (webquality === undefined) return this.quality; // 默认为正常

    // 出现 Unknown(0)、Detecting(8)、unsupported，重置连续三次的计数。 维持现有网络状态（断网/弱网/正常）
    if (webquality === 0 || webquality === 8) {
      this._resetQualities();
      return this.quality;
    }
    // Down(6)，重置连续三次的计数，且RTM返回断网。网络状态变成“断网”
    if (webquality === 6) {
      this._resetQualities();
      this.quality = AGNetworkQuality.down;
      return this.quality;
    }
    this._updateQualities(webquality);

    // 如果没有返回足够的长度，那么返回上次的结果
    if (this.qualities.length < QualityCalc.MAX_QUALITY_NUMBER) {
      return this.quality;
    }
    let total = this.qualities.reduce((a, b) => a + b);
    if (total >= 10) {
      this.quality = AGNetworkQuality.bad;
    } else {
      this.quality = AGNetworkQuality.good;
    }
    return this.quality;
  }
}
