import { RendererPlayer } from "@/ui-kit/utilities/renderer-player";
import { useGlobalContext, useVolumeContext, useMediaContext, useRoomContext, useStreamListContext, useUserListContext, EduMediaStream } from "agora-edu-core";
import { observer } from "mobx-react";
import { useCallback, useMemo, useState, useEffect } from "react";
import { transI18n, Select, Volume, Toast } from "~ui-kit";
import {v4 as uuidv4} from 'uuid';
import classnames from "classnames";
import { AgoraMediaDeviceEnum } from "agora-edu-core";
import { GenericErrorWrapper } from "agora-rte-sdk";

const VolumeIndicationView = observer(() => {
    const {
        microphoneLevel
    } = useVolumeContext()
    // const {
        // microphoneLevel
    // } = usePretestContext()

    return (
        <Volume
            currentVolume={microphoneLevel}
            maxLength={48}
            style={{marginLeft: 6}}
        />
    )
})


export const Premium = observer(() => {

    const {
        startPreview,
        stopPreview,
        pretestNoticeChannel,
        pretestCameraRenderer,
        cameraList,
        microphoneList,
        cameraRenderer,
        changeCamera,
        getCameraList,
        getMicrophoneList,
        changeMicrophone,
        installDevices
    } = useMediaContext()

    const {
        joinRoom,
        destroyRoom
    } = useRoomContext()

    const {
        isJoined
    } = useGlobalContext()

    const {
        localUserInfo
    } = useUserListContext()

    const {
        muteVideo,
        muteAudio,
        unmuteAudio,
        unmuteVideo,
        streamList,
        teacherStream,
        studentStreams
    } = useStreamListContext()

    const remoteStreams = [teacherStream].concat(studentStreams).filter((s:EduMediaStream) => !s.isLocal)

    const [isPreview, setPreview] = useState<boolean>(false)

    useEffect(() => {
        installDevices({video:true, audio: true})
    }, [installDevices])

    const startPreviewCallback = useCallback(async () => {
        try {
            await getCameraList()
            await changeCamera(cameraList[1].deviceId)
        } catch (err) {
            Toast.show({
                type: 'error',
                text: `${GenericErrorWrapper(err)}`,
                closeToast: () => {

                }
            })
        }
        try {
            await getMicrophoneList()
            const deviceId = cameraList[1]?.deviceId ?? AgoraMediaDeviceEnum.Disabled
            await changeMicrophone(deviceId)
        } catch (err) {
            Toast.show({
                type: 'error',
                text: `${GenericErrorWrapper(err)}`,
                closeToast: () => {
                    
                }
            })
        }
        await startPreview((evt: any) => {
            pretestNoticeChannel.next({type: 'error', info: transI18n(evt.info), kind: 'toast', id: uuidv4()})
        })
        setPreview(true)
    }, [cameraList, changeCamera, changeMicrophone, microphoneList, pretestNoticeChannel, startPreview])

    const stopPreviewCallback = useCallback(async () => {
        stopPreview()
        setPreview(false)
    }, [stopPreview])

    const unmuteVideoCallback = useCallback(async () => {
        unmuteVideo(localUserInfo.userUuid, true)
    }, [localUserInfo.userUuid, unmuteVideo])

    const muteVideoCallback = useCallback(async () => {
        muteVideo(localUserInfo.userUuid, true)
    }, [localUserInfo.userUuid, muteVideo])

    const joinCallback = useCallback(async () => {
        try {
            await getCameraList()
            await changeCamera(cameraList[1].deviceId)
        } catch (err) {
            Toast.show({
                type: 'error',
                text: `${GenericErrorWrapper(err)}`,
                closeToast: () => {
                    
                }
            })
        }
        try {
            await getMicrophoneList()
            const deviceId = cameraList[1]?.deviceId ?? AgoraMediaDeviceEnum.Disabled
            await changeMicrophone(deviceId)
        } catch (err) {
            Toast.show({
                type: 'error',
                text: `${GenericErrorWrapper(err)}`,
                closeToast: () => {
                    
                }
            })
        }
        await joinRoom()
    }, [cameraList, changeCamera, joinRoom])


    const leaveCallback = useCallback(async () => {
        await destroyRoom
    }, [destroyRoom])

    // const setMirrorCallback = () => setMirror((value) => !value)

    const cameraOptions = cameraList.map(item => ({label: item.label, value: item.deviceId, i18n: true}))
    const microphoneOptions = microphoneList.map(item => ({label: item.label, value: item.deviceId, i18n: true}))

    const MediaPreview = observer(({
        isPreview,
        cameraId,
        cameraOptions,
        microphoneId,
        microphoneOptions,
        changeTestCamera,
        changeTestMicrophone
    }: any) => {

        const [isMirror, setMirror] = useState<boolean>(false)

        const mirrorCls = classnames({
            'text-white py-2 px-8':1,
            'bg-blue-500': !isMirror,
            'bg-red-500': isMirror,
        })


        const VideoPreviewPlayer = useCallback(() => {    
            return (
                <RendererPlayer
                    className="camera-placeholder camera-muted-placeholder"
                    style={{width: 320, height: 180}}
                    mirror={isMirror}
                    key={cameraId}
                    id="stream-player"
                    track={pretestCameraRenderer}
                    preview={true}
                />
            )
        }, [pretestCameraRenderer, cameraId, isMirror])

        // const {microphoneLevel} = useMediaContext() 

        if (!isPreview) {
            return <></>
        }

        return (
        <>
            <button className={mirrorCls} onClick={() => {
                setMirror((value) => !value)
            }}>mirror</button>
            <Select 
                value={cameraId}
                onChange={changeTestCamera}
                options={cameraOptions}
            >
            </Select>
            <Select 
                value={microphoneId}
                onChange={changeTestMicrophone}
                options={microphoneOptions}
            >
            </Select>
            <VolumeIndicationView />
            <VideoPreviewPlayer />
        </>
        )
    })

    const btnClass = classnames({
        ['bg-blue-500 text-white py-2 px-8 w-full']: 1
      })

    const previewText = useMemo(() => {
        return isPreview ? 'stopPreview' : 'startPreview'
    }, [isPreview])

    return (
        <div className="container mx-auto md:flex h-full">
            <div style={{
                maxWidth: 'calc(.25rem * 64)'
            }}>
                <button className={btnClass} onClick={joinCallback}>join</button>
                <button className={btnClass} onClick={leaveCallback}>leave</button>
                <button className={btnClass} onClick={startPreviewCallback}>startPreview</button>
                <button className={btnClass} onClick={stopPreviewCallback}>stopPreview</button>
                <button className={btnClass} onClick={unmuteVideoCallback}>unmuteVideo</button>
                <button className={btnClass} onClick={muteVideoCallback}>muteVideo</button>
            </div>
            <div style={{
                minWidth: 'calc(100% - (.25rem * 64))'
            }} className="grid grid-cols-3">
                <div className="h-40">
                    <RendererPlayer style={{height:'100%'}} key={cameraRenderer && cameraRenderer.videoTrack ? cameraRenderer.videoTrack.getTrackId() : ''} track={cameraRenderer} id={"local"} className="rtc-video">
                    </RendererPlayer>
                </div>
                {
                    remoteStreams.map((stream:EduMediaStream, key: number) => {
                        return (
                            <div key={key} className="h-40">
                                <RendererPlayer style={{height:'100%'}} key={stream && stream.renderer && stream.renderer.videoTrack && stream.renderer.videoTrack.getTrackId()} track={stream.renderer} id={stream.streamUuid} className="rtc-video">
                                </RendererPlayer>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
})