import { RendererPlayer } from "@/ui-kit/utilities/renderer-player";
import { useGlobalContext, useVolumeContext, useMediaContext, useRoomContext, useStreamListContext } from "agora-edu-core";
import { observer } from "mobx-react";
import { useCallback, useMemo, useState } from "react";
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
        cameraId,
        changeTestCamera,
        cameraList,
        changeTestMicrophone,
        microphoneList,
        microphoneId,
        microphoneLevel,
    } = useMediaContext()

    const {
        joinRoom
    } = useRoomContext()

    const {
        isJoined
    } = useGlobalContext()

    const {
        teacherStream: userStream
    } = useStreamListContext()

    const [isPreview, setPreview] = useState<boolean>(false)

    const previewCallback = useCallback(async () => {
        if (isPreview) {
            stopPreview()
            setPreview(false)
        } else {
            await startPreview((evt: any) => {
                pretestNoticeChannel.next({type: 'error', info: transI18n(evt.info), kind: 'toast', id: uuidv4()})
            })
            setPreview(true)
        }
    }, [isPreview])

    const joinCallback = useCallback(async () => {
        await joinRoom()
    }, [joinRoom])

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
                <button className={previewCls} onClick={previewCallback}>{previewText}</button>
            </div>
            <div style={{
                minWidth: 'calc(100% - (.25rem * 64))'
            }} className="grid grid-cols-3">
                <div className="h-40">
                    {isJoined ? 
                    <RendererPlayer style={{height:'100%'}} key={userStream.renderer && userStream.renderer.videoTrack ? userStream.renderer.videoTrack.getTrackId() : ''} track={userStream.renderer} id={userStream.streamUuid} className="rtc-video">
                        
                    </RendererPlayer>
                    :null
                    } 
                </div>
                <div className="h-40">
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
                </div>
            </div>
        </div>
    )
})