import { useStore } from '@/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import React, { FC, useCallback, useEffect, useMemo } from 'react';
import tw, { styled } from 'twin.macro';
import { Button, SvgImg, useI18n, SvgIconEnum } from '~ui-kit';
import { Volume } from './volume';
import { Field } from './form-field';
import { EduRteEngineConfig, EduRteRuntimePlatform } from 'agora-edu-core';
import { getAssetURL } from '@/infra/utils';
import pretestAudio from './assets/pretest-audio.mp3';

export const PretestVoice = observer(() => {
  return (
    <PreTestContainer>
      <MicrophoneTest />
      <SpeakerTest />
    </PreTestContainer>
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
      aiDenoiserSupported
    },
  } = useStore();
  const handlePlaybackChange = useCallback((value) => {
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
    return pretestAudio
  }, [])

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
          className='fcr-speaker-test-btn'
          type="primary"
          icon={<SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.PRETEST_SPEAKER} size={24} />}
          onClick={() => startPlaybackDeviceTest(audioPlayUrl)}>
          {transI18n('pretest.test')}
        </Button>
      </ItemForm>
      {
        aiDenoiserSupported && <React.Fragment>
          <ItemCardTitle className='mt-4'> {transI18n('pretest.audio_noise_cancellation')}</ItemCardTitle>
          <div className='flex'>
            <div onClick={enableAIDenoiser} className="cursor-pointer flex mr-4">
              <SvgImg type={aiDenoiserEnabled ? SvgIconEnum.PRETEST_CHECKED : SvgIconEnum.PRETEST_CHECK} />
              {transI18n('pretest.on')}
            </div>
            <div onClick={disableAIDenoiser} className="cursor-pointer flex">
              <SvgImg type={aiDenoiserEnabled ? SvgIconEnum.PRETEST_CHECK : SvgIconEnum.PRETEST_CHECKED} />
              {transI18n('pretest.off')}
            </div>
          </div>
        </React.Fragment>
      }

    </ItemCard>
  );
});

const VolumeDance: FC = observer(() => {
  const {
    pretestUIStore: { localVolume },
  } = useStore();

  return (
    <VolumeDanceContainer>
      <SvgImg type={SvgIconEnum.MICROPHONE_ON} />
      <Volume maxLength={18} cursor={localVolume} peek={100} />
    </VolumeDanceContainer>
  );
});

const PreTestContainer = styled.div`
  padding: 40px 30px;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 20px;
`;

const ItemCard = styled.div`
  border-radius: 18px;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(51, 50, 68, 0.1);
`;
const ItemCardTitle = styled.span`
  font-weight: 700;
  font-size: 16px;
  ${tw`text-level1`}
`;

const ItemForm = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
  height: 42px;
  & .form-field-wrap {
    width: 100%;
  }
  & .form-field-label {
    display: none;
  }
`;

const VolumeDanceContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;
