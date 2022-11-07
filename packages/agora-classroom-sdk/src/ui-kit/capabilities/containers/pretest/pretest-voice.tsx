import { useStore } from '@/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { FC, useCallback, useEffect } from 'react';
import tw, { styled } from 'twin.macro';
import { AButton as Button, SvgImg, transI18n, SvgIconEnum } from '~ui-kit';
import { Volume } from './volume';
import { Field } from '@/app/components/form-field';
import { pretestAudioURI } from './data-uris';

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
    },
  } = useStore();
  const handlePlaybackChange = useCallback((value) => {
    setPlaybackDevice(value);
  }, []);

  useEffect(() => {
    return stopPlaybackDeviceTest;
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
        <AButton
          type="primary"
          icon={<SvgImg colors={{ iconPrimary: '#fff' }} type={SvgIconEnum.PRETEST_SPEAKER} size={16} />}
          onClick={() => startPlaybackDeviceTest(pretestAudioURI)}>
          {transI18n('pretest.test')}
        </AButton>
      </ItemForm>
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
  height: 156px;
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

const AButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  text-indent: 6px;
  font-size: 16px;
  background: #000;
  height: 42px;
  flex-basis: 100px;
  flex-shrink: 0;
  border-color: #000;
  &:hover,
  &:focus {
    background: #000;
    border-color: #000;
  }
  /* .ant-btn-primary:hover, .ant-btn-primary:focus */
`;

const VolumeDanceContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;
