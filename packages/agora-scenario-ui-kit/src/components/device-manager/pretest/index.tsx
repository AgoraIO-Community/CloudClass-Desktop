import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Select } from '~components/select'
import { Slider } from '~components/slider'
import { Icon } from '~components/icon'
import { Volume } from '~components/volume'
import { CheckBox } from '~components/table'
import { Button } from '~components/button';
import { VideoPlayer } from '~components/video-player'
import './index.css';

const { Option } = Select

interface DeviceProps {
    deviceId: string;
    label: string;
}

export interface PretestProps extends BaseProps {
    isMirror?: boolean; // 是否镜像
    cameraList?: DeviceProps[]; // 摄像头设备数组
    cameraId?: string; // 选中的摄像头Id
    microphoneList?: DeviceProps[]; // 麦克风设备数组
    micorophoneId?: string; // 选中的麦克风Id
    speakerList?: DeviceProps[]; // 扬声器设备数组
    speakerId?: string; // 选中的扬声器Id
    isNative?: boolean; // web平台没有扬声器下拉
    microphoneVolume?: number; // 麦克风音量
    microphoneLevel?: number;
    speakerVolume?: number; // 扬声器音量
    speakerLevel?: number;
    cameraError?: boolean; // 展示摄像头错误信息
    microphoneError?: boolean; // 展示麦克风错误信息
    onSelectMirror?: (isMirror: boolean) => void;
    onChangeDevice?: (deviceType: string, value: string) => void | Promise<void>;
    onChangeAudioVolume?: (deviceType: string, value: number) => void;
}

export const Pretest: FC<PretestProps> = ({
    isMirror = true,
    cameraList = [],
    cameraId,
    microphoneList = [],
    micorophoneId,
    speakerList = [],
    speakerId,
    isNative = true,
    microphoneVolume = 50,
    speakerVolume = 50,
    microphoneLevel = 0,
    speakerLevel = 0,
    cameraError = false,
    microphoneError = false,
    className,
    onSelectMirror = (isMirror) => {},
    onChangeDevice = (deviceType, value) => {},
    onChangeAudioVolume = (deviceType, value) => {},
    ...restProps
}) => {
    const cls = classnames({
        [`pretest`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <div className={cls} {...restProps}>
            <div className="pretest-left">
                <div className="device-choose">
                    <div className="device-title">
                        <span className="device-title-text">摄像头</span>
                        <span>
                            <CheckBox 
                                style={{width: 12, height: 12}} 
                                checked={isMirror}
                                onChange={(e: any) => {
                                    console.log('isMirror', e.target.checked)
                                    onSelectMirror(e.target.checked)
                                }}
                            /> 
                            <span className="camera-mode" style={{marginLeft: 5}}>镜像模式</span>
                        </span>
                    </div>
                    <Select 
                        defaultValue={cameraId}
                        onChange={async value => {
                            await onChangeDevice('camera', value)
                        }}
                    >
                        {cameraList.map(item => (<Option key={item.deviceId} value={item.deviceId}>{item.label}</Option>))}
                    </Select>
                    <VideoPlayer
                        uid={''}
                        onCameraClick={uid => new Promise(() => {})}
                        onMicClick={uid => new Promise(() => {})}
                        onSendStar={uid => new Promise(() => {})}
                        onWhiteboardClick={uid => new Promise(() => {})}
                        onOffPodiumClick={uid => new Promise(() => {})}
                        controlPlacement='top'
                    />
                </div>
            </div>
            <div className="pretest-right">
                <div className="device-choose">
                    <div className="device-title">
                        <span className="device-title-text">麦克风</span>
                    </div>
                    <Select 
                        defaultValue={micorophoneId}
                        onChange={async value => {
                            await onChangeDevice('microphone', value)
                        }}
                    >
                        {microphoneList.map(item => (<Option key={item.deviceId} value={item.deviceId}>{item.label}</Option>))}
                    </Select>
                    {isNative ? (
                        <div className="device-volume">
                            <span className="device-text">音量</span>
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
                            currentVolumn={microphoneLevel}
                            maxLength={48}
                            style={{marginLeft: 6}}
                        />
                    </div>
                </div>
                <div className="device-choose">
                    <div className="device-title">
                        <span className="device-title-text">扬声器</span>
                    </div>
                    {isNative ? (
                        <>
                            <Select 
                                defaultValue={speakerId}
                                onChange={async value => {
                                    await onChangeDevice('speaker', value)
                                }}
                            >
                                {speakerList.map(item => (<Option key={item.deviceId} value={item.deviceId}>{item.label}</Option>))}
                            </Select>
                            <div className="device-volume">
                                <span className="device-text">音量</span>
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
                            currentVolumn={speakerLevel}
                            maxLength={33}
                            style={{marginLeft: 6}}
                        />
                        <Button type="secondary" style={{marginLeft: 10}}>扬声器检测</Button>
                    </div>
                </div>
                <div className="pretest-error-info">
                    {cameraError ? (
                        <div className="error-info">
                            <Icon type="camera-off" color="#BDBDCA"/>
                            <span className="error-info-desc">摄像头被拔出或摄像头已占用，无法显示视频！</span>
                        </div>
                    ) : ""}
                    {microphoneError ? (
                        <div className="error-info">
                            <Icon type="microphone-off-outline" color="#BDBDCA"/>
                            <span className="error-info-desc">麦克风被拔出或麦克风被占用，无法使用麦克风！</span>
                        </div>
                    ) : ""}
                </div>
            </div>
        </div>
    )
}