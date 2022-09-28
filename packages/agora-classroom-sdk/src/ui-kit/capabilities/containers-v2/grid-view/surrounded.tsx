import { useStore } from "@/infra/hooks/ui-store";
import { EduStreamUI } from "@/infra/stores/common/stream/struct";
import { EduStudyRoomUIStore } from "@/infra/stores/study-room";
import { AgoraRteRemoteStreamType } from "agora-rte-sdk";
import { observer } from "mobx-react";
import React from "react";
import useMeasure from "react-use-measure";
import { SvgIconEnum, SvgImg } from "~components";
import { AutoSubscriptionRemoteTrackPlayer, LocalTrackPlayer } from "./players";
import { GridTools } from "./tools";



type CellProps = {
    stream: EduStreamUI,
    canPlay: boolean,
    streamType?: AgoraRteRemoteStreamType
}

const GridCell = observer(({ stream, canPlay, streamType }: CellProps) => {
    const { streamUIStore } = useStore() as EduStudyRoomUIStore;

    const { localCameraStream, localScreenStream, connected } = streamUIStore;

    const [ref, bounds] = useMeasure();

    const width = 'calc(100% - 4px)';

    const height = bounds.width * 0.5625;

    const isLocal = () => {
        return stream.stream === localCameraStream || stream.stream === localScreenStream;
    }

    return (
        <div ref={ref} className="fcr-divided-grid-view__cell mb-2 overflow-hidden relative flex items-center justify-center flex-shrink-0" style={{ width, height }}>
            {
                canPlay && connected ? (isLocal() ? <LocalTrackPlayer stream={stream.stream} /> : <AutoSubscriptionRemoteTrackPlayer stream={stream.stream} streamType={streamType} />) :
                    <div className="h-full flex items-center justify-center">{stream.fromUser.userName}</div>
            }
        </div>
    );
});



export const SurroundedGridView = observer(() => {
    const { streamUIStore } = useStore() as EduStudyRoomUIStore;

    const { pinnedStream, participant8Streams, showPager } = streamUIStore;

    return (
        <div className='fcr-surrounded-grid-view w-full h-full flex relative'>
            {/* Main */}
            <div className="fcr-surrounded-grid-view__main flex-grow flex items-center" style={{ paddingRight: 12 }}>
                {pinnedStream &&
                    <GridTools className="w-full" stream={pinnedStream}>
                        <GridCell stream={pinnedStream.stream} canPlay={pinnedStream.canPlay} streamType={AgoraRteRemoteStreamType.HIGH_STREAM} />
                    </GridTools>
                }
            </div>
            {/* Aside */}
            <div className="fcr-surrounded-grid-view__aside flex flex-col items-end overflow-auto" style={{ width: 210, height: 'calc(100vh - 130px)' }}>
                {
                    participant8Streams.map((stream) => {
                        return (
                            <GridTools key={stream.stream.stream.streamUuid} className="w-full" stream={stream}>
                                <GridCell stream={stream.stream} canPlay={stream.canPlay} />
                            </GridTools>
                        );
                    })
                }
            </div>
            {showPager && <Pager />}
        </div>
    );
});



export const Pager = observer(() => {
    const { streamUIStore } = useStore() as EduStudyRoomUIStore;
    const { nextPage, prevPage, totalPage, pageIndex } = streamUIStore;
    return (
        <React.Fragment>
            <div className='fcr-pager flex flex-col items-center absolute' style={{ right: 168, top: 1, fontSize: 12 }}>
                <div className='fcr-pager-item cursor-pointer' onClick={prevPage}>
                    <SvgImg type={SvgIconEnum.BACKWARD} size={32} colors={{ iconPrimary: '#fff' }} style={{ transform: 'rotate(90deg)' }} />
                </div>
                <span className='my-1'>{pageIndex + 1}/{totalPage}</span>
            </div>
            <div className='fcr-pager flex flex-col items-center absolute' style={{ right: 168, bottom: 11, fontSize: 12 }}>
                <span className='my-1'>{pageIndex + 1}/{totalPage}</span>
                <div className='fcr-pager-item cursor-pointer' onClick={nextPage}>
                    <SvgImg type={SvgIconEnum.BACKWARD} size={32} colors={{ iconPrimary: '#fff' }} style={{ transform: 'rotate(-90deg)' }} />
                </div>
            </div>
        </React.Fragment>
    )
});