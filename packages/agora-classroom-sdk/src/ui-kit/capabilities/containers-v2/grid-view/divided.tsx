import { useStore } from '@/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { EduStudyRoomUIStore } from '@/infra/stores/study-room';
import './index.css';
import useMeasure from 'react-use-measure';
import { useMemo } from 'react';
import { calculateGridMatrix } from './helper';
import { AutoSubscriptionRemoteTrackPlayer, LocalTrackPlayer } from './players';
import { EduStreamUI } from '@/infra/stores/common/stream/struct';
import { GridTools } from './tools';
import { SvgIconEnum, SvgImg } from '~components';
import React from 'react';


type CellProps = {
    stream: EduStreamUI,
    canPlay: boolean,
    outerSize: { width: number, height: number },
}

const GridCell = observer(({ stream, canPlay, outerSize }: CellProps) => {
    const { streamUIStore } = useStore() as EduStudyRoomUIStore;

    const { localCameraStream, localScreenStream, connected } = streamUIStore;

    const isLocal = () => {
        return stream.stream === localCameraStream || stream.stream === localScreenStream;
    }

    return (
        <div className="fcr-divided-grid-view__cell overflow-hidden" style={{ height: outerSize.height, width: outerSize.width }}>
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

    const { participant20Streams, showPager } = streamUIStore;

    const { matrix, numOfCols, numOfRows } = calculateGridMatrix(participant20Streams.length);

    let count = 0;

    const [ref, bounds] = useMeasure();

    const outerSize = useMemo(() => {
        let perCellWidth = bounds.width / numOfCols - 8;

        let perCellHeight = perCellWidth * 0.5625;

        if (perCellHeight > bounds.height) {
            perCellHeight = bounds.height / numOfRows - 8;
            perCellWidth = perCellHeight / 0.5625;
        }

        return ({ width: perCellWidth, height: perCellHeight });
    }, [bounds.width, bounds.height, numOfCols, numOfRows]);



    return (
        <div ref={ref} className='fcr-divided-grid-view relative flex justify-center w-full' style={{ height: 'calc(100vh - 155px)' }}>
            <div className='fcr-divided_grid-view__inner flex flex-wrap items-center' style={{ gap: 8, alignSelf: 'center' }}>
                {
                    matrix.map((rows) => {
                        return rows.map(() => {
                            const stream = participant20Streams[count++];

                            return (
                                <GridTools key={stream.stream.stream.streamUuid} stream={stream}>
                                    <GridCell outerSize={outerSize} stream={stream.stream} canPlay={stream.canPlay} />
                                </GridTools>
                            );
                        })
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
            <div className='fcr-pager flex flex-col items-center absolute' style={{ left: 18, fontSize: 12, top: '40%', zIndex: 10 }}>
                <div className='fcr-pager-item cursor-pointer' onClick={prevPage}>
                    <SvgImg type={SvgIconEnum.BACKWARD} size={32} colors={{ iconPrimary: '#fff' }} />
                </div>
                <span className='my-1'>{pageIndex + 1}/{totalPage}</span>
            </div>
            <div className='fcr-pager flex flex-col items-center absolute' style={{ right: 18, fontSize: 12, top: '40%', zIndex: 10 }}>
                <div className='fcr-pager-item cursor-pointer' onClick={nextPage}>
                    <SvgImg type={SvgIconEnum.BACKWARD} size={32} colors={{ iconPrimary: '#fff' }} style={{ transform: 'rotate(180deg)' }} />
                </div>
                <span className='my-1'>{pageIndex + 1}/{totalPage}</span>
            </div>
        </React.Fragment>
    )
});