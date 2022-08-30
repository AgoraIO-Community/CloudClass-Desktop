import { useStore } from "@/infra/hooks/ui-store";
import { EduStreamUI } from "@/infra/stores/common/stream/struct";
import { useDrag } from "@use-gesture/react";
import { EduStream } from "agora-edu-core";
import { observer } from "mobx-react";
import { CSSProperties, FC, useState } from "react";
import useMeasure from "react-use-measure";
import { StreamPlayer } from ".";

export const DragableContainer: FC<
    {
        stream: EduStreamUI;
    }> = observer(
        ({
            stream,
        }) => {
            const [ref, bounds] = useMeasure();
            const [translate, setTranslate] = useState([0, 0]);
            const { streamWindowUIStore } = useStore();
            const { setStreamDragInformation, streamDraggable: streamDragable } = streamWindowUIStore;

            const handleDragStream = ({
                stream,
                active,
                xy,
            }: {
                stream: EduStream;
                active: boolean;
                xy: [number, number];
            }) => {
                streamDragable && setStreamDragInformation({ stream, active, pos: xy });
            };

            const bind = useDrag(({ args: [stream], active, xy, movement: [mx, my] }) => {
                const delta = [xy[0] - bounds.x, xy[1] - bounds.y];

                setTranslate(delta);
                !active && setTranslate([0, 0]);
                if (Math.abs(mx) >= 3 || Math.abs(my) >= 3) {
                    handleDragStream({ stream: stream.stream, active, xy });
                    // active && setVisible(false);
                }
            });

            return (
                <div
                    ref={ref}
                    {...bind(stream)}
                    style={{
                        touchAction: 'none',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        background: 'transparent',
                        width: '100%',
                        height: '100%',
                        zIndex: 3,
                        transform: `translate(${translate[0]}px, ${translate[1]}px)`,
                    }} />
            );
        },
    );



export const DragableStream = observer(
    ({
        stream,
        style,
        playerStyle
    }: {
        stream?: EduStreamUI;
        style?: CSSProperties;
        playerStyle?: CSSProperties
    }) => {
        const { streamWindowUIStore } = useStore();
        const { streamDraggable: streamDragable, handleDBClickStreamWindow } = streamWindowUIStore;

        const handleStreamDoubleClick = () => {
            streamDragable && stream && handleDBClickStreamWindow(stream.stream);
        };

        return stream ? (
            <div style={{ position: 'relative', ...style }} onDoubleClick={handleStreamDoubleClick}>
                <StreamPlayer renderAt='Bar' stream={stream} style={playerStyle} />
            </div>
        ) : null;

    },
);
