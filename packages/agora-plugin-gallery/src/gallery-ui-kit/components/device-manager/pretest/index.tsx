import classnames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~components/button';
import { t, transI18n } from '~components/i18n';
import { Icon } from '~components/icon';
import { BaseProps } from '~components/interface/base-props';
import { Select } from '~components/select';
import { Slider } from '~components/slider';
import { CheckBox } from '~components/table';
import { Volume } from '~components/volume';
import './index.css';

interface DeviceProps {
    deviceId: string;
    label: string;
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
    microphoneVolume?: number; // 麦克风音量
    microphoneLevel?: number;
    speakerTestUrl?: string; // 音频地址用于测试扬声器
    speakerVolume?: number; // 扬声器音量
    speakerLevel?: number;
    cameraError?: boolean; // 展示摄像头错误信息
    microphoneError?: boolean; // 展示麦克风错误信息
    onSelectMirror?: (isMirror: boolean) => void;
    onChangeDevice?: (deviceType: string, value: string) => void | Promise<void>;
    onChangeAudioVolume?: (deviceType: string, value: number) => void;
    onSelectDevice?: (deviceType: string, value: string) => void | Promise<void>;
    videoComponent?: React.ReactElement
}

export const Pretest: React.FC<PretestProps> = ({
    isMirror = true,
    cameraList = [],
    cameraId,
    microphoneList = [],
    microphoneId,
    speakerList = [],
    speakerId,
    isNative = false,
    microphoneVolume = 50,
    speakerVolume = 50,
    microphoneLevel = 0,
    speakerTestUrl,
    speakerLevel = 0,
    cameraError = false,
    microphoneError = false,
    className,
    videoComponent,
    onSelectMirror = (isMirror) => {},
    onChangeDevice = (deviceType, value) => {},
    onChangeAudioVolume = (deviceType, value) => {},
    onSelectDevice = (deviceType, value) => {},
    ...restProps
}) => {

    const [disable, setDisable] = useState<boolean>(false)

    const [level, setLevel] = useState<number>(0)

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
        // if (!isNative) {
        //     timer.current = window.setInterval(() => {
        //         setLevel(audioElement.volume * 100)
        //     })
        // }
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

    const cameraOptions = cameraList.map(item => ({label: item.label, value: item.deviceId}))
    const microphoneOptions = microphoneList.map(item => ({label: item.label, value: item.deviceId}))
    const speakerOptions = speakerList.map(item => ({label: item.label, value: item.deviceId}))

    return (
        <div className={cls} {...restProps}>
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
                    <Select 
                        value={cameraId}
                        onChange={async value => {
                            await onChangeDevice('camera', value)
                        }}
                        options={cameraOptions}
                    >
                    </Select>
                    {videoComponent && React.cloneElement(videoComponent, {}, null)}
                </div>
            </div>
            <div className="pretest-right">
                <div className="device-choose">
                    <div className="device-title">
                        <span className="device-title-text">{t('media.microphone')}</span>
                    </div>
                    <Select 
                        value={microphoneId}
                        onChange={async value => {
                            await onChangeDevice('microphone', value)
                        }}
                        options={microphoneOptions}
                    >
                        
                    </Select>
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
                        <Volume
                            currentVolume={microphoneLevel}
                            maxLength={48}
                            style={{marginLeft: 6}}
                        />
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
                            // currentVolume={isNative ? speakerLevel : level}
                            currentVolume={testLevel}
                            maxLength={33}
                            style={{marginLeft: 6}}
                        />
                        <Button disabled={disable} type="secondary" style={{marginLeft: 10}} onClick={handleTestSpeakerClick}>{t('media.test_speaker')}</Button>
                    </div>
                </div>
                <div className="pretest-error-info">
                    {cameraError ? (
                        <div className="error-info">
                            <Icon type="camera-off" color="#BDBDCA"/>
                            <span className="error-info-desc">{transI18n('media.camera_error')}</span>
                        </div>
                    ) : ""}
                    {microphoneError ? (
                        <div className="error-info">
                            <Icon type="microphone-off-outline" color="#BDBDCA"/>
                            <span className="error-info-desc">{transI18n('media.microphone_error')}</span>
                        </div>
                    ) : ""}
                </div>
            </div>
        </div>
    )
}