import classnames from 'classnames';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { CSSTransition } from 'react-transition-group';
import { Subject } from 'rxjs';
import { Button } from '~components/button';
import { t, transI18n } from '~components/i18n';
import { Icon } from '~components/icon';
import { BaseProps } from '~components/interface/base-props';
import { Select } from '~components/select';
import { Slider } from '~components/slider';
import { CheckBox } from '~components/table';
import { Toast } from '~components/toast';
import { useMounted, useTimeout } from '~utilities/hooks';
import { Volume } from '~components/volume';
import './index.css';
import { SvgImg } from '~ui-kit/components/svg-img';

interface DeviceProps {
  deviceId: string;
  label: string;
  i18n?: boolean;
}

export interface PretestProps extends BaseProps {
  isMirror?: boolean; // 是否镜像
  cameraList?: DeviceProps[]; // 摄像头设备数组
  cameraId?: string; // 选中的摄像头Id
  microphoneList?: DeviceProps[]; // 麦克风设备数组
  microphoneId?: string; // 选中的麦克风Id
  speakerList?: DeviceProps[]; // 扬声器设备数组
  speakerId?: string; // 选中的扬声器Id
  isNative?: boolean; // web平台没有扬声器下拉
  microphoneVolume?: number;
  speakerTestUrl?: string; // 音频地址用于测试扬声器
  speakerVolume?: number; // 扬声器音量
  speakerLevel?: number;
  cameraError?: boolean; // 展示摄像头错误信息
  microphoneError?: boolean; // 展示麦克风错误信息
  onSelectMirror?: (isMirror: boolean) => void;
  onChangeDevice?: (deviceType: string, value: string) => void | Promise<void>;
  onChangeAudioVolume?: (deviceType: string, value: number) => void;
  onSelectDevice?: (deviceType: string, value: string) => void | Promise<void>;
  videoComponent?: any;
  volumeComponent?: React.ReactNode;
  pretestChannel: Subject<any>;
  isBeauty?: boolean;
  onSelectBeauty?: (isBeauty: boolean) => void;
  whitening?: number; // 美白
  buffing?: number; // 磨皮
  ruddy?: number; // 红润
  onChangeBeauty?: (beautyType: string, value: number) => void;
}

const PretestComponent: React.FC<PretestProps> = ({
  isMirror = true,
  cameraList = [],
  cameraId,
  microphoneList = [],
  microphoneId,
  speakerList = [],
  speakerId,
  isNative = false,
  microphoneVolume,
  speakerVolume = 50,
  speakerTestUrl,
  speakerLevel = 0,
  cameraError = false,
  microphoneError = false,
  className,
  videoComponent,
  volumeComponent,
  onSelectMirror = (isMirror) => {},
  onChangeDevice = (deviceType, value) => {},
  onChangeAudioVolume = (deviceType, value) => {},
  onSelectDevice = (deviceType, value) => {},
  pretestChannel,
  isBeauty = false,
  whitening = 70,
  buffing = 50,
  ruddy = 10,
  onSelectBeauty = (isBeauty) => {},
  onChangeBeauty = (beautyType, value) => {},
  ...restProps
}) => {
  const [disable, setDisable] = useState<boolean>(false);

  const [testLevel, setTestLevel] = useState<number>(0);

  const timer = useRef<any>(null);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, [audioElementRef]);

  const handleTestSpeakerClick = () => {
    const audioElement = new Audio(speakerTestUrl);
    audioElement.onended = () => {
      setDisable(false);
      // !isNative && setLevel(0)
      setTestLevel(0);
      timer.current && window.clearInterval(timer.current);
    };
    audioElement.play();
    audioElementRef.current = audioElement;
    timer.current = window.setInterval(() => {
      setTestLevel(Math.floor(Math.random() * 34));
    }, 500);
    setDisable(true);
  };

  useEffect(() => {
    timer.current && window.clearInterval(timer.current);
  }, [timer]);

  const cls = classnames({
    [`pretest`]: 1,
    [`${className}`]: !!className,
  });

  const cameraOptions = cameraList.map((item) => ({
    label: item.label,
    value: item.deviceId,
    i18n: false,
  }));
  const microphoneOptions = microphoneList.map((item) => ({
    label: item.label,
    value: item.deviceId,
    i18n: false,
  }));
  const speakerOptions = speakerList.map((item) => ({
    label: item.label,
    value: item.deviceId,
    i18n: false,
  }));

  const [noticeMessage, setMessage] = useState<
    { id: string; type: 'video' | 'audio' }[]
  >([]);

  const removeMessages = (id: any) =>
    setMessage((list) => list.filter((it: any) => it.id !== id));

  const [toastQueue, setToastQueue] = useState<any[]>([]);

  const [activeBeauty, setActiveBeauty] = useState<
    'whitening' | 'buffing' | 'ruddy'
  >('whitening');

  const removeToast = (id: any) => {
    setToastQueue((oldArray) => oldArray.filter((it: any) => it.id !== id));
  };

  useEffect(() => {
    pretestChannel &&
      pretestChannel.subscribe({
        next: (evt: any) => {
          console.log('subscribe:next', evt);
          if (evt.kind === 'toast') {
            setToastQueue((oldArray) => {
              const state = [...oldArray.concat(evt)];
              console.log('subscribe set state ', state);
              return state;
            });
          } else {
            setMessage((oldArray: any[]) => oldArray.concat(evt));
          }
        },
      });
    return () => {
      pretestChannel && pretestChannel.complete();
    };
  }, [pretestChannel]);

  const DeviceNotice = (props: any) => {
    const mounted = useMounted();

    useTimeout(() => {
      props.close && props.close();
    }, 2500);

    const [animated, setAnimate] = useState<boolean>(false);

    useLayoutEffect(() => {
      // Promise.resolve().then(() => {
      if (mounted) {
        setAnimate(true);
      }
      // })
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
            {props.title}
            <div className="popover-triangle"></div>
          </div>
        </div>
      </CSSTransition>
    );
  };

  const NoticeContainer = (props: any) => {
    return (
      <>
        {props.list.map((it: any) => (
          <DeviceNotice
            key={it.id}
            title={transI18n('pretest.detect_new_device')}
            close={() => {
              props.removeMessages(it.id);
            }}></DeviceNotice>
        ))}
      </>
    );
  };

  const PretestToastContainer = (props: any) => {
    return (
      <div style={{ justifyContent: 'center', display: 'flex' }}>
        {props.toastQueue.map((value: any, idx: number) => (
          <Toast
            style={{ position: 'absolute', top: 50 * (idx + 1), zIndex: 9999 }}
            key={`${value.id}`}
            type={value.type}
            closeToast={() => {
              props.removeToast(`${value.id}`);
            }}>
            {transI18n(value.info)}
          </Toast>
        ))}
      </div>
    );
  };
  return (
    <div className={cls} {...restProps}>
      <div className="pretest-toast">
        <PretestToastContainer
          toastQueue={toastQueue}
          removeToast={removeToast}
        />
      </div>
      <div className="pretest-left" style={{ width: 318 }}>
        <div className="device-choose">
          <div className="device-title">
            <span className="device-title-text">
              {transI18n('media.camera')}
            </span>
            <div
              style={{
                display: 'flex',
              }}>
              {isNative ? (
                <span className="device-beauty-box" style={{ marginRight: 7 }}>
                  <CheckBox
                    style={{ width: 12, height: 12 }}
                    checked={isBeauty}
                    onChange={(e: any) => {
                      onSelectBeauty(e.target.checked);
                    }}
                  />
                  <span className="beauty-text" style={{ marginLeft: 5 }}>
                    {transI18n('media.beauty')}
                  </span>
                </span>
              ) : null}
              <span className="device-mirror-box">
                <CheckBox
                  style={{ width: 12, height: 12 }}
                  checked={isMirror}
                  onChange={(e: any) => {
                    onSelectMirror(e.target.checked);
                  }}
                />
                <span className="camera-mode" style={{ marginLeft: 5 }}>
                  {transI18n('media.mirror')}
                </span>
              </span>
            </div>
          </div>
          <div className="select-section">
            <NoticeContainer
              list={noticeMessage.filter((it: any) => it.type === 'video')}
              removeMessages={removeMessages}
            />
            <Select
              value={cameraId}
              onChange={async (value) => {
                await onChangeDevice('camera', value);
              }}
              options={cameraOptions}></Select>
          </div>
          <div
            style={{
              position: 'relative',
              width: 320,
              height: 180,
            }}>
            {/* {videoComponent && React.cloneElement(videoComponent, {}, null)} */}
            {videoComponent && videoComponent()}
            {isNative && isBeauty ? (
              <div className="beauty-operation-wrap">
                <div className="beauty-operation-top">
                  {activeBeauty === 'whitening' ? (
                    <>
                      <Slider
                        min={0}
                        max={100}
                        defaultValue={whitening}
                        step={1}
                        onChange={async (value) => {
                          await onChangeBeauty('whitening', value);
                        }}></Slider>
                      <span className="beauty-show-number">+{whitening}</span>
                    </>
                  ) : null}
                  {activeBeauty === 'buffing' ? (
                    <>
                      <Slider
                        min={0}
                        max={100}
                        defaultValue={buffing}
                        step={1}
                        onChange={async (value) => {
                          await onChangeBeauty('buffing', value);
                        }}></Slider>
                      <span className="beauty-show-number">+{buffing}</span>
                    </>
                  ) : null}
                  {activeBeauty === 'ruddy' ? (
                    <>
                      <Slider
                        min={0}
                        max={100}
                        defaultValue={ruddy}
                        step={1}
                        onChange={async (value) => {
                          await onChangeBeauty('ruddy', value);
                        }}></Slider>
                      <span className="beauty-show-number">+{ruddy}</span>
                    </>
                  ) : null}
                </div>
                <div className="beauty-operation-bottom">
                  {['whitening', 'buffing', 'ruddy'].map((item, index) => (
                    <div
                      className="beauty-operation-item"
                      key={index}
                      style={{
                        opacity: activeBeauty === item ? 1 : 0.5,
                      }}
                      onClick={() => {
                        setActiveBeauty(item as any);
                      }}>
                      <Icon type={item as any} useSvg size={18} />
                      <div className="operation-item-desc">
                        {transI18n(`media.${item}`)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="pretest-right">
        <div className="device-choose">
          <div className="device-title">
            <span className="device-title-text">
              {transI18n('media.microphone')}
            </span>
          </div>
          <div className="select-section">
            <NoticeContainer
              list={noticeMessage.filter((it: any) => it.type === 'audio')}
              removeMessages={removeMessages}
            />
            <Select
              value={microphoneId}
              onChange={async (value) => {
                await onChangeDevice('microphone', value);
              }}
              options={microphoneOptions}></Select>
          </div>
          {isNative ? (
            <div className="device-volume">
              <span className="device-text">
                {transI18n('media.microphone_volume')}
              </span>
              <Slider
                min={0}
                max={100}
                defaultValue={microphoneVolume}
                step={1}
                onChange={async (value) => {
                  await onChangeAudioVolume('microphone', value);
                }}></Slider>
            </div>
          ) : (
            ''
          )}
          <div className="device-volume-test">
            <SvgImg type="microphone-on-outline" style={{ color: '#0073FF' }} />
            {volumeComponent && React.cloneElement(volumeComponent, {}, null)}
          </div>
        </div>
        <div className="device-choose">
          <div className="device-title">
            <span className="device-title-text">
              {transI18n('media.speaker')}
            </span>
          </div>
          <Select
            value={speakerId}
            onChange={async (value) => {
              await onChangeDevice('speaker', value);
            }}
            options={speakerOptions}></Select>
          {isNative ? (
            <div className="device-volume">
              <span className="device-text">{transI18n('media.volume')}</span>
              <Slider
                min={0}
                max={100}
                defaultValue={speakerVolume}
                step={1}
                onChange={async (value) => {
                  await onChangeAudioVolume('speaker', value);
                }}></Slider>
            </div>
          ) : (
            ''
          )}
          <div className="device-volume-test">
            <SvgImg type="speaker" style={{ color: '#0073FF' }} />
            <Volume
              currentVolume={testLevel}
              maxLength={33}
              style={{ marginLeft: 6 }}
            />
            <Button
              disabled={disable}
              type="secondary"
              style={{ marginLeft: 10 }}
              onClick={handleTestSpeakerClick}>
              {transI18n('media.test_speaker')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Pretest = React.memo(PretestComponent);
