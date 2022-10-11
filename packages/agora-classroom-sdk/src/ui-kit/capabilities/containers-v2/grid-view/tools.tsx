import { useStore } from "@/infra/hooks/ui-store";
import { EduStudyRoomUIStore } from "@/infra/stores/study-room";
import { StreamCellUI } from "@/infra/stores/study-room/stream-ui";
import classNames from "classnames";
import { observer } from "mobx-react";
import { CSSProperties, FC, useState } from "react";
import { SvgIconEnum, SvgImg } from "~components";



type Props = {
    className?: string;
    style?: CSSProperties;
    stream: StreamCellUI;
}

export const GridTools: FC<Props> = observer(({ children, className, style, stream }) => {
    const { streamUIStore, layoutUIStore } = useStore() as EduStudyRoomUIStore;

    const { blackList, togglePinUser, toggleUserBlackList, pinnedUser, localUserUuid } = layoutUIStore;

    const { getPinnedStream } = streamUIStore;

    let pinnedStream: StreamCellUI | undefined = undefined;

    if (pinnedUser) {
        pinnedStream = getPinnedStream(pinnedUser);
    }

    let pinIcon = SvgIconEnum.PIN;
    let eyeIcon = SvgIconEnum.EYE_CLOSE;

    if (pinnedStream && pinnedStream.stream.stream.streamUuid === stream.stream.stream.streamUuid) {
        pinIcon = SvgIconEnum.UNPIN;
    }

    if (blackList.has(stream.stream.fromUser.userUuid)) {
        eyeIcon = SvgIconEnum.EYE_OPEN;
    }

    const cls = classNames('fcr-grid-tools relative', className, {

    });

    const isLocalStream = stream.stream.fromUser.userUuid === localUserUuid;


    const handleAdd = () => {
        toggleUserBlackList(stream.stream.fromUser.userUuid);
    }
    const handlePin = () => {
        togglePinUser(stream.stream.fromUser.userUuid);
    }

    return (
        <div className={cls} style={style}>
            <div className="absolute z-10 flex" style={{ right: 6, top: 6 }}>
                <ToolButton icon={pinIcon} onClick={handlePin} />
                {!isLocalStream && <ToolButton icon={eyeIcon} onClick={handleAdd} />}
            </div>
            {children}
        </div>
    );
});

export const ToolButton: FC<{ icon: SvgIconEnum, onClick: () => void }> = ({ icon, onClick }) => {
    const [hover, setHover] = useState(false);

    const handleMouse = (enter: boolean) => () => {
        setHover(enter)
    }

    const cls = classNames("fcr-grid-tools__item cursor-pointer ml-2", {
    })

    return (
        <div className={cls} onMouseEnter={handleMouse(true)} onMouseLeave={handleMouse(false)} onClick={onClick}>
            <SvgImg type={icon} colors={{ iconPrimary: '#fff' }} />
        </div>
    );
}