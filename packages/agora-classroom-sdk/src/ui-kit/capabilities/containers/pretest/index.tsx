import { observer } from 'mobx-react';
import './index.css';
import { CameraPlaceHolder, Modal, SvgIconEnum, SvgImg, Tooltip } from '~ui-kit';
import classnames from 'classnames';
import React, { FC, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { Button } from '~ui-kit/components/button';
import { transI18n, useI18n } from '~ui-kit/components/i18n';
import { BaseProps } from '~ui-kit/components/util/type';
import { Select } from '~ui-kit/components/select';
import { CheckBox } from '~ui-kit/components/checkbox';
import { Toast } from '~ui-kit/components/toast';
import { useMounted, useTimeout } from '~ui-kit/utilities/hooks';
import { Volume } from '~ui-kit/components/volume';
import PretestAudio from './assets/pretest-audio.mp3';
import './index.css';
import { useStore } from '@/infra/hooks/ui-store';
import { Slider } from '~ui-kit/components/slider';
import { BeautyType, EduRteEngineConfig, EduRteRuntimePlatform } from 'agora-edu-core';
import { isProduction } from '@/infra/utils/env';
import { PretestToast } from '@/infra/stores/common/pretest';
import { InteractionStateColors } from '~ui-kit/utilities/state-color';
declare global {
  interface Window {
    process: {
      resourcesPath: string;
    };
  }
}


interface IBeautySiderProps {
  value: number;
  className?: string;
  onChange: (value: number) => void;
}

const LocalAudioVolumeIndicator: React.FC<any> = observer(() => {
  const { pretestUIStore } = useStore();
  const { localVolume } = pretestUIStore;

  return <Volume currentVolume={localVolume} maxLength={48} style={{ marginLeft: 6 }} />;
});

export const PretestVideoPlayerLocalCameraPlaceholder = observer(() => {
  const { pretestUIStore } = useStore();
  const { localCameraPlaceholder } = pretestUIStore;
  return (
    <CameraPlaceHolder style={{ position: 'absolute', top: 0 }} state={localCameraPlaceholder} />
  );
});

export const MicrophoneSelect = observer(() => {
  const {
    pretestUIStore: { setRecordingDevice, currentRecordingDeviceId, recordingDevicesList },
  } = useStore();

  return (
    <Select
      value={currentRecordingDeviceId}
      onChange={(value) => {
        setRecordingDevice(value);
      }}
      options={recordingDevicesList}></Select>
  );
});

export const CameraSelect = observer(() => {
  const {
    pretestUIStore: { setCameraDevice, currentCameraDeviceId, cameraDevicesList },
  } = useStore();

  return (
    <Select
      value={currentCameraDeviceId}
      onChange={(value) => {
        setCameraDevice(value);
      }}
      options={cameraDevicesList}></Select>
  );
});

export const PlaybackSelect = observer(() => {
  const {
    pretestUIStore: { setPlaybackDevice, currentPlaybackDeviceId, playbackDevicesList },
  } = useStore();

  return (
    <Select
      value={currentPlaybackDeviceId}
      onChange={(value) => {
        setPlaybackDevice(value);
      }}
      options={playbackDevicesList}></Select>
  );
});

const BeautyControllerBar = observer(() => {
  if (EduRteEngineConfig.platform !== EduRteRuntimePlatform.Electron) return null;
  const {
    pretestUIStore: {
      isBeauty,
      setActiveBeautyType,
      activeBeautyValue,
      setActiveBeautyValue,
      activeBeautyTypeIcon,
    },
  } = useStore();

  return (
    <CSSTransition in={isBeauty} timeout={300} unmountOnExit classNames="beauty-bar-animate">
      <div className="beauty-bar">
        <div className="beauty-bar-left">
          {[{ id: 'whitening', icon: SvgIconEnum.WHITENING }, { id: 'buffing', icon: SvgIconEnum.BUFFING }, { id: 'ruddy', icon: SvgIconEnum.RUDDY }].map((item) => {
            const icon = activeBeautyTypeIcon(item);
            return (
              <Tooltip key={item.id} title={transI18n(`media.${item}`)} placement="top">
                <SvgImg
                  className='beauty-type-icon'
                  type={icon.icon}
                  colors={{ iconPrimary: icon.color }}
                  size={22}
                  onClick={() => setActiveBeautyType(item.id as BeautyType)}
                />
              </Tooltip>
            )
          }
          )}
        </div>
        <BeautySider value={activeBeautyValue} onChange={setActiveBeautyValue} />
      </div>
    </CSSTransition>
  );
});

const BeautySider: React.FC<IBeautySiderProps> = ({ value, className, onChange }) => {
  return (
    <div className={classnames('beauty-bar-right', className)}>
      <Slider
        className="beauty-bar-silder"
        min={0}
        max={100}
        value={value}
        step={1}
        onChange={onChange}></Slider>
      <span className="beauty-show-number">{value}</span>
    </div>
  );
};

const VideoDeviceNotification = observer(() => {
  const { pretestUIStore } = useStore();
  const { videoToastQueue, removeToast } = pretestUIStore;
  return <NoticeContainer list={videoToastQueue} removeToast={removeToast} />;
});

const AudioRecordingDeviceNotification = observer(() => {
  const { pretestUIStore } = useStore();
  const { audioRecordingToastQueue, removeToast } = pretestUIStore;
  return <NoticeContainer list={audioRecordingToastQueue} removeToast={removeToast} />;
});

const AudioPlaybackDeviceNotification = observer(() => {
  const { pretestUIStore } = useStore();
  const { audioPlaybackToastQueue, removeToast } = pretestUIStore;
  return <NoticeContainer list={audioPlaybackToastQueue} removeToast={removeToast} />;
});

const NoticeContainer: FC<
  {
    list: PretestToast[];
    removeToast: (id: string) => void;
  }
> = observer(({ list, removeToast }) => {
  const t = useI18n();
  return (
    <React.Fragment>
      {
        list.map((it) => (
          <DeviceNotice
            key={it.id}
            title={t('pretest.detect_new_device')}
            close={() => {
              removeToast(it.id);
            }} />
        ))
      }
    </React.Fragment>
  );
});

const DeviceNotice: FC<{
  title: string;
  close: () => void;
}> = ({ title, close = () => { } }) => {
  const mounted = useMounted();

  useTimeout(() => {
    close();
  }, 2500);

  const [animated, setAnimate] = useState<boolean>(false);

  useLayoutEffect(() => {
    if (mounted) {
      setAnimate(true);
    }
  }, []);

  return (
    <CSSTransition
      in={animated}
      onEntered={() => {
        setAnimate(!animated);
        console.log('onEnter');
      }}
      // unmountOnExit
      timeout={3000}
      classNames="popover-transition">
      <div className="popover-section">
        <div className="popover-notice">
          {title}
          <div className="popover-triangle"></div>
        </div>
      </div>
    </CSSTransition>
  );
};

const PlaybackTestPlayer = observer(() => {
  const {
    pretestUIStore: {
      startPlaybackDeviceTest,
      stopPlaybackDeviceTest,
      playbackTesting,
    },
  } = useStore();
  const urlRef = useRef<string>(PretestAudio);

  useEffect(() => {
    if (EduRteEngineConfig.platform === EduRteRuntimePlatform.Electron) {
      const path = window.require('path');
      urlRef.current = isProduction
        ? `${window.process.resourcesPath}/pretest-audio.mp3`
        : path.resolve('./assets/pretest-audio.mp3');
    }
    return stopPlaybackDeviceTest;
  }, []);

  return (
    <div className="device-volume-test">
      <div
        className="test-speaker"
        onClick={() => {
          startPlaybackDeviceTest(urlRef.current);
        }}>
        {playbackTesting ? (
          <div className="test-speakering-icon"></div>
        ) : (
          <SvgImg type={SvgIconEnum.TEST_SPEAKER} size={22} colors={{ iconPrimary: InteractionStateColors.allow }} />
        )}
        <div className="test-btn">{transI18n('media.test_speaker')}</div>
      </div>
    </div>
  );
});

const PretestNotificationCenter = observer(() => {
  const { pretestUIStore } = useStore();
  const { errorToastQueue, removeToast } = pretestUIStore;

  return (
    <div className="pretest-toast">
      <div style={{ justifyContent: 'center', display: 'flex' }}>
        {errorToastQueue.map((value, idx: number) => (
          <Toast
            key={`${value.id}`}
            style={{ position: 'absolute', top: 50 * (idx + 1), zIndex: 9999 }}
            type="error"
            closeToast={() => {
              removeToast(`${value.id}`);
            }}>
            {transI18n(value.info)}
          </Toast>
        ))}
      </div>
    </div>
  );
});

export const TrackPlayer = observer(() => {
  const {
    pretestUIStore: { setupLocalVideo, isMirror },
  } = useStore();

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      setupLocalVideo(ref.current, isMirror);
    }
  }, [ref, isMirror]);

  return <div style={{ width: '100%', height: '100%' }} ref={ref}></div>;
});

export const CameraPreviewPlayer = observer(() => {
  const { pretestUIStore } = useStore();
  const { localCameraOff } = pretestUIStore;

  return (
    <>
      <PretestVideoPlayerLocalCameraPlaceholder />
      {!localCameraOff ? <TrackPlayer /> : null}
    </>
  );
});

export const CameraMirrorCheckBox = observer(() => {
  const {
    pretestUIStore: { setMirror, isMirror },
  } = useStore();

  return (
    <CheckBox
      checked={isMirror}
      onChange={(e) => {
        setMirror((e.target as any).checked);
      }}
    />
  );
});

const BeautyCheckBox = observer(() => {
  const {
    pretestUIStore: { setBeauty, isBeauty },
  } = useStore();
  return (
    <CheckBox
      checked={isBeauty}
      onChange={(e) => {
        setBeauty((e.target as any).checked);
      }}
    />
  );
});

const CameraMirrorCheckBoxContainer = () => {
  return (
    <span className="media-choice-box">
      <CameraMirrorCheckBox />
      <span className="camera-mode">{transI18n('media.mirror')}</span>
    </span>
  );
};

const BeautyCheckBoxContainer = () => {
  return EduRteEngineConfig.platform === EduRteRuntimePlatform.Electron ? (
    <span className="media-choice-box">
      <BeautyCheckBox />
      <span className="beauty-mode" style={{ marginLeft: 5 }}>
        {transI18n('media.beauty')}
      </span>
    </span>
  ) : null;
};

const CameraDeviceManager = () => {
  return (
    <div className="device-choose">
      <div className="device-title">
        <span className="device-title-text">{transI18n('media.camera')}</span>
        <div className="media-choice">
          <BeautyCheckBoxContainer />
          <CameraMirrorCheckBoxContainer />
        </div>
      </div>
      <div className="select-section">
        <VideoDeviceNotification />
        <CameraSelect />
      </div>
      <div className="pretest-video-wrap">
        <CameraPreviewPlayer />
        <BeautyControllerBar />
      </div>
    </div>
  );
};

const RecordingDeviceManager = () => {
  const {
    pretestUIStore: { startRecordingDeviceTest, stopRecordingDeviceTest },
  } = useStore();
  useEffect(() => {
    startRecordingDeviceTest();
    return stopRecordingDeviceTest;
  });

  return (
    <div className="device-choose">
      <div className="device-title">
        <span className="device-title-text">{transI18n('media.microphone')}</span>
      </div>
      <div className="select-section">
        <AudioRecordingDeviceNotification />
        <MicrophoneSelect />
      </div>
      <div className="device-volume-test">
        <SvgImg type={SvgIconEnum.MICROPHONE_ON_OUTLINE} colors={{ iconPrimary: InteractionStateColors.allow }} />
        <LocalAudioVolumeIndicator />
      </div>
    </div>
  );
};

const PlayoutDeviceManager = () => {
  return (
    <div className="device-choose">
      <div className="device-title">
        <span className="device-title-text">{transI18n('media.speaker')}</span>
      </div>
      <div className="select-section">
        <AudioPlaybackDeviceNotification />
        <PlaybackSelect />
      </div>
      <PlaybackTestPlayer />
    </div>
  );
};

export interface PretestProps extends BaseProps {
  className?: string;
  onOK?: () => void;
}

export const RoomPretest: React.FC<PretestProps> = ({ className, onOK, ...restProps }) => {
  const cls = classnames({
    [`pretest`]: 1,
    [`${className}`]: !!className,
  });

  return (
    <div className="fixed-container">
      <Modal
        title={transI18n('pretest.settingTitle')}
        style={{ width: 720 }}
        footer={[
          <Button key="ok" action="ok">
            {transI18n('pretest.finishTest')}
          </Button>,
        ]}
        onOk={onOK}
        onCancel={() => { }}
        btnId="device_assert">
        <div className={cls} {...restProps}>
          <PretestNotificationCenter />
          <div className="pretest-left">
            <CameraDeviceManager />
          </div>
          <div className="pretest-right">
            <RecordingDeviceManager />
            <PlayoutDeviceManager />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export type RoomPretestContainerProps = {
  onOK?: () => void;
};

export const RoomPretestContainer: React.FC<RoomPretestContainerProps> = (
  { onOK } = { onOK: () => console.log('handle on ok') },
) => {
  return <RoomPretest onOK={onOK} />;
};
