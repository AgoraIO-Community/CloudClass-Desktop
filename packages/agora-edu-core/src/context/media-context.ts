import { useCallback } from 'react';
import { useCoreContext, usePretestStore } from './core';
import { MediaContext, DeviceErrorCallback } from './type';

export const useMediaContext = (): MediaContext => {
    const appStore = useCoreContext();

    const {
      mediaStore,
      isElectron, 
      pretestNotice$,
    } = appStore

    const {
        cpuUsage,
        networkQuality,
        delay,
        localPacketLostRate,
    } = mediaStore;
    // const {
    //   removeDialog
    // } = useUIStore()
  
    const pretestStore = usePretestStore()
  
    const {
      cameraList,
      microphoneList,
      speakerList,
      cameraId,
      microphoneId,
      speakerId,
      cameraRenderer,
      changeCamera,
      changeMicrophone,
      changeSpeakerVolume,
      stopDeviceTestError,
      changeMicrophoneVolume,
    } = pretestStore

    const startPreview = (onError: DeviceErrorCallback) => {
      const removeEffect = pretestStore.onDeviceTestError(onError)
      pretestStore.init({ video: true, audio: true })
      pretestStore.openTestCamera()
      pretestStore.openTestMicrophone({ enableRecording: true })
    }

    const stopPreview = () => {
      stopDeviceTestError()
      pretestStore.closeTestCamera()
      pretestStore.closeTestMicrophone()
    }
  
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
        changeDevice,
        changeAudioVolume,
        // removeDialog
        changeSpeakerVolume,
        changeMicrophoneVolume,
        changeCamera,
        changeMicrophone,
        startPreview,
        stopPreview,
        startPretestCamera: pretestStore.openTestCamera,
        stopPretestCamera: pretestStore.closeTestCamera,
        startPretestMicrophone: pretestStore.openTestMicrophone,
        stopPretestMicrophone: pretestStore.closeTestMicrophone,
        changeTestCamera: pretestStore.changeTestCamera,
        changeTestMicrophone: pretestStore.changeTestMicrophone,
        changeTestMicrophoneVolume: pretestStore.changeTestMicrophoneVolume,
        changeTestSpeakerVolume: pretestStore.changeTestSpeakerVolume,
        pretestCameraRenderer: pretestStore.cameraRenderer,
        pretestNoticeChannel: appStore.pretestNotice$,
        // microphoneLevel: pretestStore.microphoneLevel,
        microphoneLevel: 0,
    }
}