import type { AgoraNetworkQuality } from 'agora-electron-sdk/types/Api/native_type';
import { AGNetworkQuality, NetworkStats } from '../../type';

export class RtcNetworkQualityElectron {
  rtt?: number;
  downlinkNetworkQuality: AgoraNetworkQuality = 0;
  uplinkNetworkQuality: AgoraNetworkQuality = 0;
  end2EndDelay: number = 0;
  txVideoPacketLoss: number = 0;
  rxVideoPacketLoss: number = 0;
  cpu: number = -1;
  cpuTotal: number = -1;

  toAGQuality(electronQuality?: AgoraNetworkQuality): AGNetworkQuality {
    let quality: AGNetworkQuality = AGNetworkQuality.unknown;
    if (electronQuality !== undefined) {
      if (electronQuality === 0) {
        quality = AGNetworkQuality.unknown;
      } else if (electronQuality === 5 || electronQuality === 6) {
        quality = AGNetworkQuality.bad;
      } else if (electronQuality === 4) {
        quality = AGNetworkQuality.poor;
      } else if (electronQuality >= 2 && electronQuality <= 3) {
        quality = AGNetworkQuality.good;
      } else if (electronQuality >= 1 && electronQuality <= 2) {
        quality = AGNetworkQuality.great;
      }
    }
    return quality;
  }

  networkStats(): NetworkStats {
    let packetLoss = Math.max(this.txVideoPacketLoss, this.rxVideoPacketLoss);
    return {
      packetLoss,
      cpu: this.cpu,
      cpuTotal: this.cpuTotal,
      delay: this.end2EndDelay,
      networkQuality: Math.min(
        this.toAGQuality(this.downlinkNetworkQuality),
        this.toAGQuality(this.uplinkNetworkQuality),
      ),
    };
  }
}
