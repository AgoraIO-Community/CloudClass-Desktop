import React from 'react';
import { useStore } from '@/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { EduStudyRoomUIStore } from '@/infra/stores/study-room';
import { LocalTrackPlayer, RemoteTrackPlayer } from '../../containers/stream/track-player';
import './index.css';
import { range } from 'lodash';
import { EduStream } from 'agora-edu-core';


const calculateGridMatrix = (totalOfCells: number) => {
    const matrix: Array<Array<number>> = [[]];
    const sequence: { x: number, y: number }[] = [];
    const pointer = { x: 0, y: 0 };


    const getMaxRow = () => {
        return matrix[0].length === 0 ? 0 : matrix.length;
    }

    const getMaxCol = () => {
        return matrix[0]?.length || 0;
    }

    const appendToRow = () => {
        matrix[pointer.y].push(0);
        pointer.x += 1;
        sequence.push({ x: pointer.x, y: pointer.y });
    }

    const appendToCol = () => {
        matrix[pointer.y + 1].push(0);
        pointer.y += 1;
        sequence.push({ x: pointer.x, y: pointer.y });
    }


    const appendToNext = () => {
        const isLastRow = pointer.y === getMaxRow() - 1;
        const isLastCol = pointer.x === getMaxCol() - 1;
        if (isLastRow) {
            appendToRow();
        } else if (isLastCol) {
            appendToCol();
        }
    }

    const addRow = () => {
        matrix.push([0]);
        pointer.y = matrix.length - 1;
        pointer.x = 0;
        sequence.push({ x: pointer.x, y: pointer.y });
    }

    const addCol = () => {
        matrix[0].push(0);
        pointer.y = 0;
        pointer.x = matrix[0].length - 1
        sequence.push({ x: pointer.x, y: pointer.y });
    }


    range(totalOfCells).forEach((_, idx) => {
        const maxRow = getMaxRow();
        const maxCol = getMaxCol();
        // complete means it is a complete N * N matrix, next row or col will start
        const complete = maxRow * maxCol === idx;

        if (complete) {
            if (maxRow >= maxCol) {
                addCol();
                return;
            }
            if (maxRow <= maxCol) {
                addRow();
                return;
            }
        } else {
            appendToNext();
        }
    });

    return {
        matrix,
        sequence,
        numOfRows: getMaxRow(),
        numOfCols: getMaxCol()
    };
}

type CellProps = {
    stream: EduStream,
    width: string,
    height: string
}

export const GridCell = observer(({ stream, width, height }: CellProps) => {
    const { streamUIStore } = useStore() as EduStudyRoomUIStore;

    const { localStream } = streamUIStore;

    return <div className="fcr-grid-view__cell overflow-hidden" style={{ width, height }}>
        {
            localStream && stream === localStream ? <LocalTrackPlayer className='w-full h-full' /> : <RemoteTrackPlayer stream={stream} />
        }
    </div>;
});


export const GridView = observer(() => {
    const { streamUIStore } = useStore() as EduStudyRoomUIStore;

    const { participantStreams } = streamUIStore;

    const { matrix, sequence, numOfRows, numOfCols } = calculateGridMatrix(participantStreams.length);

    const cellWidth = `${100 / numOfCols}%`;
    const cellHeight = `${100 / numOfRows}%`;

    return (
        <div className='fcr-grid-view w-full h-full'>
            {
                matrix.map((rows, rowIdx) => {
                    return rows.map((_, colIdx) => {
                        // determine which stream should render in this cell
                        const idx = sequence.findIndex(({ x, y }) => x === colIdx && y === rowIdx);

                        const stream = participantStreams[idx];

                        return <GridCell key={stream.stream.streamUuid} stream={stream.stream} height={cellHeight} width={cellWidth} />
                    })
                })
            }
        </div>
    );
});