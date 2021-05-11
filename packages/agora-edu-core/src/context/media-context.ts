import { useCallback } from 'react';
import { useCoreContext, usePretestStore, useUIStore } from './core';
import { MediaContext } from './type';

export const useMediaContext = (): MediaContext => {
    const {
        mediaStore,
        isElectron
    } = useCoreContext();
    const {
        cpuUsage,
        networkQuality,
        delay,
        localPacketLostRate,
    
    } = mediaStore;
    const {
      removeDialog
    } = useUIStore()
  
    const pretestStore = usePretestStore()
  
    const {
      cameraList,
      microphoneList,
      speakerList,
      cameraId,
      microphoneId,
      speakerId,
      cameraRenderer,
      microphoneLevel,
    } = pretestStore
  
    const changeDevice = useCallback(async (deviceType: string, value: any) => {
      switch (deviceType) {
        case 'camera': {
          await pretestStore.changeCamera(value)
          break;
        }
        case 'microphone': {
          await pretestStore.changeMicrophone(value)
          break;
        }
        case 'speaker': {
          await pretestStore.changeTestSpeaker(value)
          break;
        }
      }
    }, [pretestStore])
  
    const changeAudioVolume = useCallback(async (deviceType: string, value: any) => {
      switch (deviceType) {
        case 'speaker': {
          await pretestStore.changeSpeakerVolume(value)
          break;
        }
        case 'microphone': {
          await pretestStore.changeMicrophoneVolume(value)
          break;
        }
      }
    }, [pretestStore])
    return {
        isNative: isElectron,
        cpuUsage,
        networkQuality,
        networkLatency: delay,
        packetLostRate:localPacketLostRate,
        cameraList,
        microphoneList,
        speakerList,
        cameraId,
        microphoneId,
        speakerId,
        cameraRenderer,
        microphoneLevel,
        changeDevice,
        changeAudioVolume,
        removeDialog
    }
}