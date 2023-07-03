import { useStore } from '@classroom/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import React, { FC, PropsWithChildren, useCallback, useEffect, useMemo } from 'react';
import { Button, SvgImg, SvgIconEnum } from '@classroom/ui-kit';
import { Volume } from './volume';
import { Field } from './form-field';
import { EduRteEngineConfig, EduRteRuntimePlatform } from 'agora-edu-core';
import { getAssetURL } from '@classroom/infra/utils';
import pretestAudio from './assets/pretest-audio.mp3';
import { useI18n } from 'agora-common-libs';

export const PretestVoice = observer(() => {
  return (
    <div
      className="flex flex-grow flex-col"
      style={{
        padding: '60px 30px 40px',
        gap: 20,
      }}>
      <MicrophoneTest />
      <SpeakerTest />
    </div>
  );
});

const MicrophoneTest = observer(() => {
  const {
    pretestUIStore: { setRecordingDevice, currentRecordingDeviceId, recordingDevicesList },
  } = useStore();
  const transI18n = useI18n();
  return (
    <ItemCard>
      <ItemCardTitle>{transI18n('media.microphone')}</ItemCardTitle>
      <ItemForm>
        <Field
          label=""
          type="select"
          value={currentRecordingDeviceId}
          options={recordingDevicesList.map((value) => ({
            text: value.label,
            value: value.value,
          }))}
          onChange={(value) => setRecordingDevice(value)}
        />
      </ItemForm>
      <VolumeDance />
    </ItemCard>
  );
});

const SpeakerTest = observer(() => {
  const {
    pretestUIStore: {
      playbackDevicesList,
      currentPlaybackDeviceId,
      setPlaybackDevice,
      startPlaybackDeviceTest,
      stopPlaybackDeviceTest,
      setAIDenoiser,
      aiDenoiserEnabled,
      aiDenoiserSupported,
    },
  } = useStore();
  const handlePlaybackChange = useCallback((value: string) => {
    setPlaybackDevice(value);
  }, []);

  useEffect(() => {
    return stopPlaybackDeviceTest;
  }, []);

  const transI18n = useI18n();

  const enableAIDenoiser = useCallback(() => {
    setAIDenoiser(true);
  }, []);
  const disableAIDenoiser = useCallback(() => {
    setAIDenoiser(false);
  }, []);

  const audioPlayUrl = useMemo(() => {
    if (EduRteEngineConfig.platform === EduRteRuntimePlatform.Electron) {
      return getAssetURL('pretest-audio.mp3');
    }
    return pretestAudio;
  }, []);

  return (
    <ItemCard>
      <ItemCardTitle>{transI18n('media.speaker')}</ItemCardTitle>
      <ItemForm>
        <Field
          label=""
          type="select"
          value={currentPlaybackDeviceId}
          options={playbackDevicesList.map((value) => ({
            text: value.label,
            value: value.value,
          }))}
          onChange={handlePlaybackChange}
        />
        <Button
          className="fcr-speaker-test-btn"
          type="primary"
          size="sm"
          icon={
            <SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.PRETEST_SPEAKER} size={24} />
          }
          onClick={() => startPlaybackDeviceTest(audioPlayUrl)}>
          {transI18n('pretest.test')}
        </Button>
      </ItemForm>
      {aiDenoiserSupported && (
        <React.Fragment>
          <ItemCardTitle>{transI18n('pretest.audio_noise_cancellation')}</ItemCardTitle>
          <div className="flex">
            <div onClick={enableAIDenoiser} className="cursor-pointer mr-4 flex items-center">
              <SvgImg
                type={aiDenoiserEnabled ? SvgIconEnum.PRETEST_CHECKED : SvgIconEnum.PRETEST_CHECK}
              />
              <span className="text-level1">{transI18n('pretest.on')}</span>
            </div>
            <div onClick={disableAIDenoiser} className="cursor-pointer flex items-center">
              <SvgImg
                type={aiDenoiserEnabled ? SvgIconEnum.PRETEST_CHECK : SvgIconEnum.PRETEST_CHECKED}
              />
              <span className="text-level1">{transI18n('pretest.off')}</span>
            </div>
          </div>
        </React.Fragment>
      )}
    </ItemCard>
  );
});

const VolumeDance: FC = observer(() => {
  const {
    pretestUIStore: { localVolume },
  } = useStore();

  return (
    <div className="flex" style={{ gap: 10 }}>
      <SvgImg type={SvgIconEnum.MICROPHONE_ON} />
      <Volume maxLength={18} cursor={localVolume} peek={100} />
    </div>
  );
});

const ItemCardTitle: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className="mt-4 text-level1 flex items-center"
      style={{
        fontWeight: 700,
        fontSize: 16,
      }}>
      {children}
    </div>
  );
};

const ItemForm: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className="fcr-pretest-audio flex justify-center items-center"
      style={{
        gap: 8,
        height: 42,
      }}>
      {children}
    </div>
  );
};

const ItemCard: FC<PropsWithChildren> = ({ children }) => (
  <div
    className="flex flex-col"
    style={{
      borderRadius: 18,
      padding: 20,
      boxSizing: 'border-box',
      gap: 16,
      background: 'rgba(51, 50, 68, 0.1)',
    }}>
    {children}
  </div>
);
