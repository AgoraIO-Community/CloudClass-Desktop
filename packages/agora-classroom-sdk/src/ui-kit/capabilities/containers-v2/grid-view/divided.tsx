import { useStore } from '@/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { EduStudyRoomUIStore } from '@/infra/stores/study-room';
import './index.css';
import useMeasure from 'react-use-measure';
import { useMemo, useRef } from 'react';
import { calculateGridMatrix } from './helper';
import { AutoSubscriptionRemoteTrackPlayer, LocalTrackPlayer } from './players';
import { EduStreamUI } from '@/infra/stores/common/stream/struct';
import { GridTools } from './tools';
import { SvgIconEnum, SvgImg } from '~components';
import React from 'react';


type CellProps = {
    stream: EduStreamUI,
    canPlay: boolean
}

const GridCell = observer(({ stream, canPlay }: CellProps) => {
    const { streamUIStore } = useStore() as EduStudyRoomUIStore;

    const { localCameraStream, localScreenStream, connected } = streamUIStore;

    const [ref, bounds] = useMeasure();

    const height = useMemo(() => {
        return bounds.width * 0.5625;
    }, [bounds.width]);

    const isLocal = () => {
        return stream.stream === localCameraStream || stream.stream === localScreenStream;
    }

    return (
        <div ref={ref} className="fcr-divided-grid-view__cell overflow-hidden" style={{ height, maxHeight: 'calc(100vh - 155px)' }}>
            {
                canPlay && connected ? (isLocal() ? <LocalTrackPlayer stream={stream.stream} /> :
                    <AutoSubscriptionRemoteTrackPlayer stream={stream.stream} />) :
                    <div className="h-full flex items-center justify-center">{stream.fromUser.userName}</div>
            }
        </div>
    );
});


export const DividedGridView = observer(() => {
    const { streamUIStore } = useStore() as EduStudyRoomUIStore;
    const ref = useRef<HTMLDivElement>(null);

    const { participant20Streams, showPager } = streamUIStore;

    const { matrix, sequence, numOfCols } = calculateGridMatrix(participant20Streams.length);

    return (
        <div ref={ref} className='fcr-divided-grid-view relative w-full flex flex-wrap items-center' style={{ gap: 8 }}>
            {
                matrix.map((rows, rowIdx) => {
                    return rows.map((_, colIdx) => {
                        // determine which stream should render in this cell
                        const idx = sequence.findIndex(({ x, y }) => x === colIdx && y === rowIdx);

                        const stream = participant20Streams[idx];

                        const cellWidth = `calc(${100 / numOfCols}% - ${colIdx === matrix[0].length - 1 ? 0 : 8}px)`;

                        return (
                            <GridTools key={stream.stream.stream.streamUuid} style={{ width: cellWidth }} stream={stream}>
                                <GridCell stream={stream.stream} canPlay={stream.canPlay} />
                            </GridTools>
                        );
                    })
                })
            }
            {showPager && <Pager />}
        </div>
    );
});



export const Pager = observer(() => {
    const { streamUIStore } = useStore() as EduStudyRoomUIStore;
    const { nextPage, prevPage, totalPage, pageIndex } = streamUIStore;
    return (
        <React.Fragment>
            <div className='fcr-pager flex flex-col items-center absolute' style={{ left: 18, fontSize: 12 }}>
                <div className='fcr-pager-item cursor-pointer' onClick={prevPage}>
                    <SvgImg type={SvgIconEnum.BACKWARD} size={32} colors={{ iconPrimary: '#fff' }} />
                </div>
                <span className='my-1'>{pageIndex + 1}/{totalPage}</span>
            </div>
            <div className='fcr-pager flex flex-col items-center absolute' style={{ right: 18, fontSize: 12 }}>
                <div className='fcr-pager-item cursor-pointer' onClick={nextPage}>
                    <SvgImg type={SvgIconEnum.BACKWARD} size={32} colors={{ iconPrimary: '#fff' }} style={{ transform: 'rotate(180deg)' }} />
                </div>
                <span className='my-1'>{pageIndex + 1}/{totalPage}</span>
            </div>
        </React.Fragment>
    )
});