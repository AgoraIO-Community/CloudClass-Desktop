import { useCallback } from 'react';
import { useCoreContext, usePretestStore } from './core';
import { MediaContext, DeviceErrorCallback } from './type';

export const useMediaContext = (): MediaContext => {
    const appStore = useCoreContext();

    const {
      mediaStore,
      isElectron, 
      pretestNotice$,
      pretestStore,
      sceneStore
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
  
    // const pretestStore = usePretestStore()
  
    const {
      cameraList,
      microphoneList,
      speakerList,
      cameraId,
      microphoneId,
      speakerId,
      // cameraRenderer,
      changeCamera,
      changeMicrophone,
      changeTestSpeaker,
      changeSpeakerVolume,
      stopDeviceTestError,
      changeMicrophoneVolume,
      init: installDevices,
      getCameraList,
      getMicrophoneList,
    } = pretestStore

    const startPreview = async (onError: DeviceErrorCallback) => {
      // const removeEffect = pretestStore.onDeviceTestError(onError)
      await pretestStore.init({ video: true, audio: true })
      // const cameraId = pretestStore.cameraList.slice(1)[0].deviceId
      // const microphoneId = pretestStore.microphoneList.slice(1)[0].deviceId
      // await changeCamera(cameraId)
      // await changeMicrophone(microphoneId)
      // // changeCamera('')
      // // changeMicrophone('')
      await sceneStore.enableLocalVideo2()
      await sceneStore.enableLocalAudio2()
    }

    const stopPreview = () => {
      stopDeviceTestError()
      sceneStore.disableLocalAudio2()
      sceneStore.disableLocalVideo2()
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
        changeDevice,
        changeAudioVolume,
        changeSpeaker: changeTestSpeaker,
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
        cameraRenderer: sceneStore.cameraRenderer,
        pretestCameraRenderer: pretestStore.cameraRenderer,
        pretestNoticeChannel: appStore.pretestNotice$,
        // microphoneLevel: pretestStore.microphoneLevel,
        microphoneLevel: 0,
        getCameraList,
        getMicrophoneList,
        installDevices,
        getAudioRecordingVolume: pretestStore.getAudioRecordingVolume,
        getAudioPlaybackVolume: pretestStore.getAudioPlaybackVolume
    }
}