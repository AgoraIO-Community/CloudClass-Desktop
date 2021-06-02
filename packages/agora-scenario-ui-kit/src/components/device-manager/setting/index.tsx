import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Select } from '~components/select'
import { Slider } from '~components/slider'
import './index.css';
import { t } from '~components/i18n';
import { CheckBox } from '~ui-kit/components/table';
interface DeviceProps {
    deviceId: string;
    label: string;
}

export interface SettingProps extends BaseProps {
    cameraList?: DeviceProps[]; // 摄像头设备数组
    cameraId?: string; // 选中的摄像头Id
    microphoneList?: DeviceProps[]; // 麦克风设备数组
    microphoneId?: string; // 选中的麦克风Id
    speakerList?: DeviceProps[]; // 扬声器设备数组
    speakerId?: string; // 选中的扬声器Id
    hasMicrophoneVolume?: boolean; // 是否有麦克风音量slider
    microphoneVolume?: number; // 麦克风音量
    hasSpeakerVolume?: boolean; // 是否有扬声器音量slider
    speakerVolume?: number; // 扬声器音量
    isNative?: boolean; // 是否原生
    isBeauty?: boolean; // 是否开启美颜
    whitening?: number; // 美白
    buffing?: number; // 磨皮
    ruddy?: number; // 红润
    onChangeDevice?: (deviceType: string, value: string) => void | Promise<void>;
    onChangeAudioVolume?: (deviceType: string, value: number) => void;
    onSelectDevice?: (deviceType: string, value: string) => void | Promise<void>;
    onSelectBeauty?: (isBeauty: boolean) => void;
    onChangeBeauty?: (beautyType: string, value: number) => void;
}

export const Setting: FC<SettingProps> = ({
    cameraList = [],
    cameraId,
    microphoneList = [],
    microphoneId,
    speakerList = [],
    speakerId,
    hasMicrophoneVolume = true,
    microphoneVolume = 50,
    hasSpeakerVolume = true,
    speakerVolume = 50,
    isNative = true,
    isBeauty = true,
    whitening = 50,
    buffing = 50,
    ruddy = 50,
    onChangeDevice = (deviceType, value) => {},
    onChangeAudioVolume = (deviceType, value) => {},
    onSelectDevice = (deviceType, value) => {},
    onSelectBeauty = (isBeauty) => {},
    onChangeBeauty = (beautyType, value) => {},
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`setting`]: 1,
        [`${className}`]: !!className,
    });
    const cameraOptions = cameraList.map(item => ({label: item.label, value: item.deviceId, i18n: true}))
    const microphoneOptions = microphoneList.map(item => ({label: item.label, value: item.deviceId, i18n: true}))
    const speakerOptions = speakerList.map(item => ({label: item.label, value: item.deviceId, i18n: true}))
    return (
        <div className={cls} {...restProps} style={{width: 318}}>
            <div className="device-choose">
                <div 
                    className="device-title"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <div>{t('device.camera')}</div>
                    {isNative ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <CheckBox
                                style={{ width: 12, height: 12 }}
                                checked={isBeauty}
                                onChange={(e: any) => {
                                    onSelectBeauty(e.target.checked)
                                }}
                            />
                            <span className="beauty-desc" style={{ marginLeft: 5 }}>{t('media.beauty')}</span>
                        </div>
                    ) : null}
                </div>
                <Select 
                    value={cameraId}
                    onChange={async value => {
                        await onChangeDevice('camera', value)
                    }}
                    options={cameraOptions}
                >
                </Select>
                {isNative && isBeauty ? (
                    <>
                        <div className="beauty-value">
                            <span className="beauty-text">{t('media.whitening')}</span>
                            <Slider
                                min={0}
                                max={100}
                                defaultValue={whitening}
                                step={1}
                                onChange={async value => {
                                    await onChangeBeauty('whitening', value)
                                }}
                            ></Slider>
                        </div>
                        <div className="beauty-value">
                            <span className="beauty-text">{t('media.buffing')}</span>
                            <Slider
                                min={0}
                                max={100}
                                defaultValue={buffing}
                                step={1}
                                onChange={async value => {
                                    await onChangeBeauty('buffing', value)
                                }}
                            ></Slider>
                        </div>
                        <div className="beauty-value">
                            <span className="beauty-text">{t('media.ruddy')}</span>
                            <Slider
                                min={0}
                                max={100}
                                defaultValue={ruddy}
                                step={1}
                                onChange={async value => {
                                    await onChangeBeauty('ruddy', value)
                                }}
                            ></Slider>
                        </div>
                    </>
                ) : null}
            </div>
            <div className="device-choose">
                <div className="device-title">{t('device.microphone')}</div>
                <Select 
                    value={microphoneId}
                    onChange={async value => {
                        await onChangeDevice('microphone', value)
                    }}
                    options={microphoneOptions}
                >
                    
                </Select>
                {
                hasMicrophoneVolume ? 
                    (
                        <div className="device-volume">
                            <span className="device-text">{t('device.microphone_volume')}</span>
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
                    ) 
                    : ""
                }

            </div>
            <div className="device-choose">
                <div className="device-title">{t('device.speaker')}</div>
                <Select
                    value={speakerId}
                    onChange={async value => {
                        await onChangeDevice('speaker', value)
                    }}
                    options={speakerOptions}
                >
                </Select>
                {
                    hasSpeakerVolume ? 
                    (
                        <div className="device-volume">
                            <span className="device-text">{t('device.speaker_volume')}</span>
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
                    ) 
                    : ""
                }

            </div>
        </div>
    )
}
