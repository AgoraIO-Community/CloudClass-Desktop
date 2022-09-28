import { useStore } from '@/infra/hooks/ui-store';
import { DialogCategory, EduShareUIStore } from '@/infra/stores/common/share-ui';
import { EduStudyRoomUIStore } from '@/infra/stores/study-room';
import { LeaveReason } from 'agora-edu-core';
import { AgoraRteMediaSourceState } from 'agora-rte-sdk';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React, { useMemo, useState } from 'react';
import { SvgIconEnum, SvgImg } from '~components';
import { IconButton } from '~components-v2';
import { getColorByLevel } from '~utilities/palette-helper';
import './index.css';


type DeviceDropdownProps = {
    disabled: boolean, muted: boolean, icon: SvgIconEnum,
    onDeviceClick: () => void;
    dropdownContent: React.ReactNode;
};

const DeviceDropdown = observer(({ disabled, muted, icon, onDeviceClick, dropdownContent }: DeviceDropdownProps) => {
    const [dropdownPanelVisible, setDropdownPanelVisible] = useState(false);
    const [hover, setHover] = useState(false);
    const [focused, setFocused] = useState(false);
    const opacity = disabled ? 0.5 : 1;
    const backgroundColor = muted ? '#F5655C' : '#18191B';

    const dropdownPanelCls = classNames("fcr-device-dropdown__panel absolute", {
        'hidden': !dropdownPanelVisible
    });

    const arrowButtonBackground = useMemo(() => {
        if (hover) {
            return getColorByLevel(backgroundColor, 7);
        }

        if (focused) {
            return getColorByLevel(backgroundColor, 8)
        }
        return backgroundColor;
    }, [backgroundColor, hover, focused]);


    const preventClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
    }

    const handleBlur = () => {
        setFocused(false);
        setDropdownPanelVisible(false);
    }

    const handleFocus = () => {
        setFocused(true);
        setDropdownPanelVisible(true);
    }

    return (
        <div className='fcr-device-dropdown relative'>
            <IconButton
                icon={icon}
                iconColor={"#fff"}
                backgroundColor={backgroundColor}
                opacity={opacity}
                disabled={disabled}
                tailSlot={
                    !disabled && <SvgImg type={SvgIconEnum.DOWN} size={9} className="invisible mx-1" />
                }
                transition='background-color .2s'
                onClick={onDeviceClick}
            />
            {/* arrow button */}
            {
                !disabled && <a
                    href="#"
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="fcr-device-dropdown__arrow-btn absolute flex items-center cursor-pointer"
                    style={{ right: 4, top: '50%', height: '70%', transform: 'translateY(-50%)', borderRadius: 6, padding: '0 5px', background: arrowButtonBackground, transition: 'background-color .2s' }}
                    onClick={preventClick}
                >
                    <SvgImg
                        type={SvgIconEnum.DOWN}
                        colors={{ iconPrimary: '#fff' }}
                        size={9}
                        style={{ transition: 'all 0.2s ease 0s', transform: 'rotate(180deg)' }}
                    />
                </a>
            }
            {/* dropdown panel */}
            <div
                className={dropdownPanelCls}
                style={{
                    width: 250,
                    background: '#21212B',
                    borderRadius: 16,
                    bottom: 'calc(100% + 24px)'
                }}
                onClick={
                    () => {
                        setDropdownPanelVisible(false);
                    }
                }
            >
                {dropdownContent}
            </div>
        </div >
    );
});

export const CameraDropdown = observer(() => {
    const { navigationBarUIStore, pretestUIStore } = useStore();
    const { localCameraOff, toggleLocalVideo } = navigationBarUIStore;
    const { cameraDevicesList, setCameraDevice, currentCameraDeviceId } = pretestUIStore;
    const disabled = false;
    const icon = localCameraOff ? SvgIconEnum.CAMERA_OFF : SvgIconEnum.CAMERA_ON;

    const handleDeviceClick = () => {
        toggleLocalVideo();
    }

    const content = (
        <React.Fragment>
            <span className='font-bold px-2'>Camera</span>
            {
                cameraDevicesList.map(({ label, value }) => {
                    const handleSelect = () => {
                        setCameraDevice(value);
                    }

                    return (
                        <div key={value} onMouseDown={handleSelect} className="fcr-device-dropdown__panel-item flex justify-between p-2 my-1 cursor-pointer">
                            <span>{label}</span>
                            {
                                currentCameraDeviceId === value && <SvgImg type={SvgIconEnum.CHECK} colors={{ iconPrimary: '#fff' }} />
                            }
                        </div>
                    );
                })
            }
        </React.Fragment>
    );

    return <DeviceDropdown disabled={disabled} muted={localCameraOff} icon={icon} onDeviceClick={handleDeviceClick} dropdownContent={content} />;
});


export const MicDropdown = observer(() => {
    const { navigationBarUIStore, pretestUIStore } = useStore();
    const { localMicOff, toggleLocalAudio } = navigationBarUIStore;
    const { recordingDevicesList, setRecordingDevice, currentRecordingDeviceId } = pretestUIStore;
    const disabled = true;
    const icon = localMicOff ? SvgIconEnum.MIC_OFF : SvgIconEnum.MIC_ON;

    const handleDeviceClick = () => {
        toggleLocalAudio();
    }

    const content = (
        <React.Fragment>
            <span className='font-bold px-2'>Microphone</span>
            {
                recordingDevicesList.map(({ label, value }) => {
                    const handleSelect = () => {
                        setRecordingDevice(value);
                    }

                    return (
                        <div key={value} onMouseDown={handleSelect} className="fcr-device-dropdown__panel-item flex justify-between p-2 my-1 cursor-pointer">
                            <span>{label}</span>
                            {
                                currentRecordingDeviceId === value && <SvgImg type={SvgIconEnum.CHECK} colors={{ iconPrimary: '#fff' }} />
                            }
                        </div>
                    );
                })
            }
        </React.Fragment>
    );


    return <DeviceDropdown disabled={disabled} muted={localMicOff} icon={icon} onDeviceClick={handleDeviceClick} dropdownContent={content} />;
});

export const ScreenShareTool = observer(() => {
    const { classroomStore } = useStore();

    const handleClick = () => {
        if (classroomStore.mediaStore.localScreenShareTrackState !== AgoraRteMediaSourceState.started) {
            classroomStore.mediaStore.startScreenShareCapture();
        } else {
            classroomStore.mediaStore.stopScreenShareCapture();
        }
    }

    return <IconButton iconColor='#fff' backgroundColor={'#343434E5'} icon={SvgIconEnum.SCREENSHARING} onClick={handleClick} />;
});


export const ChatTool = observer(() => {

    return (
        <div className="">
            {/* <Chat /> */}
            <IconButton iconColor='#fff' backgroundColor={'#343434E5'} icon={SvgIconEnum.COLORED_CHAT} />
        </div>
    );
});


export const RosterTool = observer(() => {
    const { toolbarUIStore, streamUIStore } = useStore() as EduStudyRoomUIStore;


    const handleClick = () => {
        toolbarUIStore.setTool('register');
    }


    return (
        <div className='relative overflow-hidden'>
            <div className='text-center w-full bottom-0 absolute' style={{ background: 'rgba(52, 52, 52, 0.9)', borderRadius: 12, fontSize: 16, lineHeight: '20px', pointerEvents: 'none' }}>
                {streamUIStore.orderedUserList.length > 999 ? 999 : streamUIStore.orderedUserList.length}
            </div>
            <IconButton iconColor='#fff' backgroundColor={'#343434E5'} icon={SvgIconEnum.PEOPLE} onClick={handleClick} />
        </div>
    );
});

export const Quit = observer(() => {
    const { shareUIStore, classroomStore } = useStore();
    const handleClick = () => {
        shareUIStore.addDialog(DialogCategory.Quit, {
            onOk: () => {
                classroomStore.connectionStore.leaveClassroom(LeaveReason.leave);
            },
        });
    }
    return <IconButton iconColor='#fff' backgroundColor={'#F5655C'} icon={SvgIconEnum.QUIT} onClick={handleClick} />;
});

