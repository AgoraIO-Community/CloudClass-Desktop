import { Button, Modal, Setting, t } from '~ui-kit';
import { observer } from 'mobx-react';
import { useUIStore } from '@/infra/hooks';
import { useGlobalContext, useMediaContext, usePretestContext } from 'agora-edu-core';
import { useCallback, useEffect, useState } from 'react';

export const SettingContainer = observer(({ id }: any) => {
  const {
    isNative,
    getAudioRecordingVolume,
    getAudioPlaybackVolume,
    changeCamera,
    changeMicrophone,
    changeSpeaker,
  } = useMediaContext();

  const {
    cameraList,
    microphoneList,
    speakerList,
    cameraId,
    speakerId,
    microphoneId,
    // changeCamera,
    // changeMicrophone,
    changeTestSpeakerVolume: changeSpeakerVolume,
    changeTestMicrophoneVolume: changeMicrophoneVolume,
    isMirror,
    setMirror,
    isBeauty,
    setBeauty,
    whitening,
    buffing,
    ruddy,
    setWhitening,
    setBuffing,
    setRuddy,
    setBeautyEffectOptions,
  } = usePretestContext();

  useEffect(() => {
    // {"isBeauty":true,"lighteningLevel":61,"rednessLevel":61,"smoothnessLevel":76}
    const beautyEffectOptionsStr = window.localStorage.getItem('beautyEffectOptions');
    const { isBeauty, lighteningLevel, rednessLevel, smoothnessLevel } = beautyEffectOptionsStr
      ? JSON.parse(beautyEffectOptionsStr)
      : {
          isBeauty: false,
          lighteningLevel: 70,
          rednessLevel: 10,
          smoothnessLevel: 50,
        };
    setBeauty(isBeauty);
    setWhitening(lighteningLevel);
    setBuffing(smoothnessLevel);
    setRuddy(rednessLevel);
    if (isBeauty) {
      setBeautyEffectOptions({
        lighteningLevel,
        rednessLevel,
        smoothnessLevel,
      });
    }
  }, []);

  const changeDevice = async (deviceType: string, value: any) => {
    switch (deviceType) {
      case 'camera': {
        await changeCamera(value);
        break;
      }
      case 'microphone': {
        await changeMicrophone(value);
        break;
      }
      case 'speaker': {
        await changeSpeaker(value);
      }
    }
  };

  const changeAudioVolume = async (deviceType: string, value: any) => {
    switch (deviceType) {
      case 'speaker': {
        await changeSpeakerVolume(value);
        break;
      }
      case 'microphone': {
        await changeMicrophoneVolume(value);
        break;
      }
    }
  };

  const { removeDialog } = useUIStore();

  const handleBeauty = () => {
    setBeautyEffectOptions({
      isBeauty: !isBeauty,
      lighteningLevel: whitening,
      rednessLevel: ruddy,
      smoothnessLevel: buffing,
    });
    window.localStorage.setItem(
      'beautyEffectOptions',
      JSON.stringify({
        isBeauty: !isBeauty,
        lighteningLevel: whitening,
        rednessLevel: ruddy,
        smoothnessLevel: buffing,
      }),
    );
    setBeauty(!isBeauty);
  };

  const handleMirror = () => {
    setMirror(!isMirror);
  };

  const onChangeBeauty = (type: string, value: any) => {
    switch (type) {
      case 'whitening':
        setWhitening(value);
        break;
      case 'buffing':
        setBuffing(value);
        break;
      case 'ruddy':
        setRuddy(value);
        break;
    }
    setBeautyEffectOptions({
      lighteningLevel: whitening,
      rednessLevel: ruddy,
      smoothnessLevel: buffing,
    });
    window.localStorage.setItem(
      'beautyEffectOptions',
      JSON.stringify({
        isBeauty,
        lighteningLevel: whitening,
        rednessLevel: ruddy,
        smoothnessLevel: buffing,
      }),
    );
  };

  const [speakerVolume] = useState<number>(getAudioPlaybackVolume());
  const [microphoneVolume] = useState<number>(getAudioRecordingVolume());

  return (
    <Modal
      title={t('pretest.settingTitle')}
      width={360}
      footer={[<Button action="ok">{t('toast.confirm')}</Button>]}
      onCancel={() => {
        removeDialog(id);
      }}
      onOk={() => {
        removeDialog(id);
      }}
      closable={true}>
      <Setting
        cameraList={cameraList}
        microphoneList={microphoneList}
        speakerList={speakerList}
        cameraId={cameraId}
        microphoneId={microphoneId}
        speakerId={speakerId}
        onChangeDevice={changeDevice}
        onChangeAudioVolume={changeAudioVolume}
        hasMicrophoneVolume={false}
        hasSpeakerVolume={false}
        isNative={isNative}
        isBeauty={isBeauty}
        onSelectBeauty={handleBeauty}
        whitening={whitening}
        buffing={buffing}
        ruddy={ruddy}
        onChangeBeauty={onChangeBeauty}
        isMirror={isMirror}
        onSelectMirror={handleMirror}
        speakerVolume={speakerVolume}
        microphoneVolume={microphoneVolume}
      />
    </Modal>
  );
});
