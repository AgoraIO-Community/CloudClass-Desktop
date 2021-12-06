import { AGNetworkQuality, NetworkStats } from '../../type';

export class RtcNetworkQualityWeb {
  rtt?: number;
  downlinkNetworkQuality: number = 0;
  uplinkNetworkQuality: number = 0;
  end2EndDelay: number = 0;
  txVideoPacketLoss: number = 0;
  rxVideoPacketLoss: number = 0;

  toAGQuality(webquality?: number): AGNetworkQuality {
    let quality: AGNetworkQuality = AGNetworkQuality.unknown;
    if (webquality !== undefined) {
      if (webquality === 0) {
        quality = AGNetworkQuality.unknown;
      } else if (webquality === 5 || webquality === 6) {
        quality = AGNetworkQuality.bad;
      } else if (webquality === 4) {
        quality = AGNetworkQuality.poor;
      } else if (webquality >= 2 && webquality <= 3) {
        quality = AGNetworkQuality.good;
      } else if (webquality === 1) {
        quality = AGNetworkQuality.great;
      }
    }
    return quality;
  }

  networkStats(): NetworkStats {
    let packetLoss = Math.max(this.txVideoPacketLoss, this.rxVideoPacketLoss);
    return {
      packetLoss,
      // cpu is not supported in web
      cpu: -1,
      delay: this.end2EndDelay,
      networkQuality: Math.min(
        this.toAGQuality(this.downlinkNetworkQuality),
        this.toAGQuality(this.uplinkNetworkQuality),
      ),
    };
  }
}
