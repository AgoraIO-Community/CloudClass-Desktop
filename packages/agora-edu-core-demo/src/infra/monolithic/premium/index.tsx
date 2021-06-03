import { RendererPlayer } from "@/ui-kit/utilities/renderer-player";
import { useGlobalContext, useVolumeContext, useMediaContext, useRoomContext, useStreamListContext, useUserListContext } from "agora-edu-core";
import { observer } from "mobx-react";
import { useCallback, useMemo, useState, useEffect } from "react";
import { transI18n, Select, Volume } from "~ui-kit";
import {v4 as uuidv4} from 'uuid';
import classnames from "classnames";

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
        changeMicrophone,
        installDevices
    } = useMediaContext()

    const {
        joinRoom
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
        unmuteVideo
    } = useStreamListContext()

    const [isPreview, setPreview] = useState<boolean>(false)

    useEffect(() => {
        installDevices({video:true, audio: true})
    }, [installDevices])

    const startPreviewCallback = useCallback(async () => {
        await changeCamera(cameraList[1].deviceId)
        await changeMicrophone(microphoneList[1].deviceId)
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

    const joinCallback = useCallback(async () => {
        await changeCamera(cameraList[1].deviceId)
        await joinRoom()
    }, [cameraList, changeCamera, joinRoom])

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

    const previewCls = classnames({
        ['text-white py-2 px-8']: 1,
        [`bg-blue-500 `]: !isPreview,
        [`bg-red-500 `]: isPreview,
      })

    const previewText = useMemo(() => {
        return isPreview ? 'stopPreview' : 'startPreview'
    }, [isPreview])

    return (
        <div className="container mx-auto md:flex h-full">
            <div style={{
                maxWidth: 'calc(.25rem * 64)'
            }}>
                <button className="bg-blue-500 text-white py-2 px-8" onClick={joinCallback}>join</button>
                <button className="bg-blue-500 text-white py-2 px-8" onClick={startPreviewCallback}>startPreview</button>
                <button className="bg-blue-500 text-white py-2 px-8" onClick={stopPreviewCallback}>stopPreview</button>
                <button className="bg-blue-500 text-white py-2 px-8" onClick={unmuteVideoCallback}>unmuteVideo</button>
            </div>
            <div style={{
                minWidth: 'calc(100% - (.25rem * 64))'
            }} className="grid grid-cols-3">
                <div className="h-40">
                    <RendererPlayer style={{height:'100%'}} key={cameraRenderer && cameraRenderer.videoTrack ? cameraRenderer.videoTrack.getTrackId() : ''} track={cameraRenderer} id={"local"} className="rtc-video">
                    </RendererPlayer>
                </div>
                {/* <div className="h-40">
                    <MediaPreview
                        // microphoneLevel={microphoneLevel}
                        cameraOptions={cameraOptions}
                        microphoneOptions={microphoneOptions}
                        cameraId={cameraId}
                        isPreview={isPreview}
                        microphoneId={microphoneId}
                        changeTestCamera={changeTestCamera}
                        changeTestMicrophone={changeTestMicrophone}
                    />
                </div> */}
            </div>
        </div>
    )
})