import type { AgoraNetworkQuality } from 'agora-electron-sdk/types/Api/native_type';
import { QualityCalc } from '../../../utils/networkutils';
import { NetworkStats } from '../../type';
export class RtcNetworkQualityElectron {
  rtt?: number;
  downlinkNetworkQuality: AgoraNetworkQuality = 0;
  uplinkNetworkQuality: AgoraNetworkQuality = 0;
  end2EndDelay: number = 0;
  txVideoPacketLoss: number = 0;
  rxVideoPacketLoss: number = 0;
  cpu: number = -1;
  cpuTotal: number = -1;
  private _downlinkNetworkQualityClacInstance = new QualityCalc();
  private _uplinkNetworkQualityClacInstance = new QualityCalc();

  networkStats(): NetworkStats {
    let packetLoss = Math.max(this.txVideoPacketLoss, this.rxVideoPacketLoss);
    return {
      packetLoss,
      // cpu is not supported in web
      cpu: -1,
      delay: this.end2EndDelay,
      downlinkNetworkQuality: this._downlinkNetworkQualityClacInstance.toAGQuality(
        this.downlinkNetworkQuality,
      ),
      uplinkNetworkQuality: this._uplinkNetworkQualityClacInstance.toAGQuality(
        this.downlinkNetworkQuality,
      ),
    };
  }
}
