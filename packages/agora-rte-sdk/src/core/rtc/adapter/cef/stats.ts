import { QualityCalc } from '../../../utils/networkutils';
import { NetworkStats } from '../../type';
export class RtcNetworkQualityCef {
  rtt?: number;
  downlinkNetworkQuality = 0;
  uplinkNetworkQuality = 0;
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
