import classnames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useTimeout } from '~utilities/hooks';
import { Volume } from '~components/volume';
import './index.css';

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
    videoComponent?: React.ReactElement,
    volumeComponent?: React.ReactElement,
    pretestChannel: Subject<any>
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
    ...restProps
}) => {

    const [disable, setDisable] = useState<boolean>(false)

    const [testLevel, setTestLevel] = useState<number>(0)

    const timer = useRef<any>(null)

    const audioElementRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        return () => {
            if (audioElementRef.current) {
                audioElementRef.current.pause()
            }
        }
    }, [audioElementRef])

    const handleTestSpeakerClick = () => {
        const audioElement = new Audio(speakerTestUrl);
        audioElement.onended = () => {
            setDisable(false)
            // !isNative && setLevel(0)
            setTestLevel(0)
            timer.current && window.clearInterval(timer.current)
        }
        audioElement.play()
        audioElementRef.current = audioElement
        timer.current = window.setInterval(() => {
            setTestLevel(Math.floor(Math.random() * 34))
        }, 500)
        setDisable(true)
    }

    useEffect(() => {
        timer.current && window.clearInterval(timer.current)
    }, [timer])

    const cls = classnames({
        [`pretest`]: 1,
        [`${className}`]: !!className,
    })

    const cameraOptions = cameraList.map(item => ({label: item.i18n ? transI18n(item.label) : item.label, value: item.deviceId}))
    const microphoneOptions = microphoneList.map(item => ({label: item.i18n ? transI18n(item.label) : item.label, value: item.deviceId}))
    const speakerOptions = speakerList.map(item => ({label: item.label, value: item.deviceId}))

    const [noticeMessage, setMessage] = useState<{id: string, type: 'video' | 'audio'}[]>([])

    const removeMessages = (id: any) => setMessage(list => list.filter((it: any) => it.id !== id))

    const [toastQueue, setToastQueue] = useState<any[]>([])

    const removeToast = (id: any) => {
        console.log('removeToast ', id)
        setToastQueue(oldArray => oldArray.filter((it: any) => it.id !== id))
    }

    useEffect(() => {
        pretestChannel && pretestChannel.subscribe({
            next: (evt: any) => {
                if (evt.kind === 'toast') {
                    setToastQueue(oldArray => oldArray.concat(evt))
                } else {
                    setMessage((oldArray: any[]) => oldArray.concat(evt))
                }
            }
        })
        return () => {
            pretestChannel && pretestChannel.complete()
        }
    }, [pretestChannel])

    const DeviceNotice = (props: any) => {
        useTimeout(() => {
            props.close && props.close()
        }, 2500)

        const [animated, setAnimate] = useState<boolean>(false)

        useEffect(() => {
            Promise.resolve().then(() => {
                setAnimate(true)
            })
        }, [])

        return <CSSTransition
            in={animated}
            onEntered={() => {
                setAnimate(!animated)
                console.log('onEnter')
            }}
            // unmountOnExit
            timeout={3000}
            classNames="popover-transition"
        >
            <div className="popover-section">
                <div className="popover-notice">
                {props.title}
                <div className="popover-triangle"></div>
                </div>
            </div>
        </CSSTransition>
    }

    const NoticeContainer = (props: any) => {
        return <>
            {props.list.map((it: any) => 
                <DeviceNotice key={it.id} title={transI18n('pretest.detect_new_device')}
                   close={() => {
                       props.removeMessages(it.id)
                   }}
                ></DeviceNotice>
            )}
        </>
    }

    const PretestToastContainer = (props: any) => {
        return <div style={{justifyContent: 'center', display: 'flex'}}>
            {props.toastQueue.map((value: any, idx: number) => 
            <Toast
                style={{position:'absolute', top: (50 * (idx + 1)), zIndex: 9999}}
                key={`${value.id}`}
                type={value.type}
                closeToast={() => {
                // props.removeToast(`${value.id}`)
                }}
            >{transI18n(value.info)}</Toast>
            )}
        </div>
    }

    // useEffect(() => {
    //     console.log(' notice ', noticeMessage, ' toast ', toastQueue)
    // }, [noticeMessage, toastQueue])

    return (
        <div className={cls} {...restProps}>
            <div className="pretest-toast">
                <PretestToastContainer toastQueue={toastQueue} removeToast={removeToast} />
            </div>
            <div className="pretest-left" style={{width: 318}}>
                <div className="device-choose">
                    <div className="device-title">
                        <span className="device-title-text">{t('media.camera')}</span>
                        <span className="device-mirror-box">
                            <CheckBox 
                                style={{width: 12, height: 12}} 
                                checked={isMirror}
                                onChange={(e: any) => {
                                    onSelectMirror(e.target.checked)
                                }}
                            /> 
                            <span className="camera-mode" style={{marginLeft: 5}}>{t('media.mirror')}</span>
                        </span>
                    </div>
                    <div className="select-section">
                        <NoticeContainer list={noticeMessage.filter((it: any) => it.type === 'video')} removeMessages={removeMessages} />
                        <Select 
                            value={cameraId}
                            onChange={async value => {
                                await onChangeDevice('camera', value)
                            }}
                            options={cameraOptions}
                        >
                        </Select>
                    </div>
                    {videoComponent && React.cloneElement(videoComponent, {}, null)}
                </div>
            </div>
            <div className="pretest-right">
                <div className="device-choose">
                    <div className="device-title">
                        <span className="device-title-text">{t('media.microphone')}</span>
                    </div>
                    <div className="select-section">
                    <NoticeContainer list={noticeMessage.filter((it: any) => it.type === 'audio')} removeMessages={removeMessages} />
                    <Select 
                        value={microphoneId}
                        onChange={async value => {
                            await onChangeDevice('microphone', value)
                        }}
                        options={microphoneOptions}
                    >
                    </Select>
                    </div>
                    {isNative ? (
                        <div className="device-volume">
                            <span className="device-text">{transI18n('media.microphone_volume')}</span>
                            <Slider
                                min={0}
                                max={100}
                                defaultValue={microphoneVolume}
                                step={1}
                                onChange={async value => {
                                    await onChangeAudioVolume('microphone', value)
                                }}
                            ></Slider>
                        </div>
                    ) : ""}
                    <div className="device-volume-test">
                        <Icon type="microphone-on-outline" color="#0073FF"/>
                        {volumeComponent && React.cloneElement(volumeComponent, {}, null)}
                    </div>
                </div>
                <div className="device-choose">
                    <div className="device-title">
                        <span className="device-title-text">{t('media.speaker')}</span>
                    </div>
                    {isNative ? (
                        <>
                            <Select 
                                value={speakerId}
                                onChange={async value => {
                                    await onChangeDevice('speaker', value)
                                }}
                                options={speakerOptions}
                            >
                            </Select>
                            <div className="device-volume">
                                <span className="device-text">{t('media.volume')}</span>
                                <Slider
                                    min={0}
                                    max={100}
                                    defaultValue={speakerVolume}
                                    step={1}
                                    onChange={async value => {
                                        await onChangeAudioVolume('speaker', value)
                                    }}
                                ></Slider>
                            </div>
                        </>
                    ) : ""}
                    <div className="device-volume-test">
                        <Icon type="speaker" color="#0073FF"/>
                        <Volume
                            currentVolume={testLevel}
                            maxLength={33}
                            style={{marginLeft: 6}}
                        />
                        <Button disabled={disable} type="secondary" style={{marginLeft: 10}} onClick={handleTestSpeakerClick}>{t('media.test_speaker')}</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const Pretest = React.memo(PretestComponent)