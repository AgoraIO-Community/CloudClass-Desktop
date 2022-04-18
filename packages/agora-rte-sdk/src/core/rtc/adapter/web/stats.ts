import { Injectable, Log } from '../../../decorator';
import { QualityCalc } from '../../../utils/networkutils';
import { NetworkStats } from '../../type';

@Log.attach({ proxyMethods: false })
export class RtcNetworkQualityWeb {
  protected logger!: Injectable.Logger;
  rtt?: number;
  downlinkNetworkQuality: number = 0;
  uplinkNetworkQuality: number = 0;
  end2EndDelay: number = 0;
  txVideoPacketLoss: number = 0;
  rxVideoPacketLoss: number = 0;
  private _downlinkNetworkQualityClacInstance = new QualityCalc();
  private _uplinkNetworkQualityClacInstance = new QualityCalc();

  networkStats(): NetworkStats {
    const packetLoss = Math.max(this.txVideoPacketLoss, this.rxVideoPacketLoss);

    const networkStats = {
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

    return networkStats;
  }
}

export type PacketStats = {
  lossPackets: number;
  totalPackets: number;
};
