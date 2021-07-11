import { useMediaStore } from './core';
import { ClassroomStatsContext } from './type';

export const useClassroomStatsContext = (): ClassroomStatsContext => {
    const {
        cpuUsage,
        networkQuality,
        delay,
        localPacketLostRate,
        txPacketLossRate,
        rxPacketLossRate,
        rxNetworkQuality,
        txNetworkQuality
    } = useMediaStore();

    return {
        cpuUsage,
        networkQuality,
        networkLatency: delay,
        packetLostRate:localPacketLostRate,
        txPacketLossRate,
        rxPacketLossRate,
        rxNetworkQuality,
        txNetworkQuality,
    }
}

