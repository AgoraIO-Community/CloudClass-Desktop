import { QualityCalc } from '../../../utils/networkutils';
import { NetworkStats } from '../../type';
export class RtcNetworkQualityWeb {
  rtt?: number;
  downlinkNetworkQuality: number = 0;
  uplinkNetworkQuality: number = 0;
  end2EndDelay: number = 0;
  txVideoPacketLoss: number = 0;
  rxVideoPacketLoss: number = 0;
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
