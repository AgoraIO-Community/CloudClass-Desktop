import { RendererPlayer } from "@/ui-kit/utilities/renderer-player";
import { useGlobalContext, useRoomContext, useStreamListContext } from "agora-edu-core";
import { observer } from "mobx-react";
import { useCallback } from "react";


export const Premium = observer(() => {
    const {
        joinRoom
    } = useRoomContext()

    const {
        isJoined
    } = useGlobalContext()

    const {
        teacherStream: userStream
    } = useStreamListContext()

    const joinCallback = useCallback(async () => {
        await joinRoom()
    }, [joinRoom])

    return (
        <div className="container mx-auto md:flex h-full">
            <div style={{
                maxWidth: 'calc(.25rem * 64)'
            }}>
                <button className="bg-blue-500 text-white py-2 px-8" onClick={joinCallback}>join</button>
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
            </div>
        </div>
    )
})