import { useLectureH5UIStores } from '@classroom/infra/hooks/ui-store';
import { EduLectureH5UIStore } from '@classroom/infra/stores/lecture-h5';
import { StreamPlayerH5 } from './index.mobile';
import { CSSProperties, FC, MutableRefObject, useEffect, useRef, useState } from 'react';
import { EduClassroomConfig } from 'agora-edu-core';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import dayjs from 'dayjs';
import { Scheduler } from 'agora-rte-sdk';
import { EduStreamUI } from '@classroom/infra/stores/common/stream/struct';
import { transI18n } from 'agora-common-libs';

const RoomBigTeacherStreamH5Tool = ({
  onPip,
  onLandscape,
  size,
  visible = false,
}: {
  size: 'lg' | 'sm';
  onPip: () => void;
  onLandscape: () => void;
  visible: boolean;
}) => {
  return (
    <div
      style={{ opacity: visible ? 1 : 0, visibility: visible ? 'visible' : 'hidden' }}
      className={`fcr-stream-h5-tool-${size}`}>
      <SvgImg onClick={onPip} type={SvgIconEnum.PIP} size={24}></SvgImg>
      <SvgImg onClick={onLandscape} type={SvgIconEnum.LANDSCAPE} size={24}></SvgImg>
    </div>
  );
};
const useMobileStreamTool = ({
  triggerRef,
  teacherCameraStream,
}: {
  triggerRef: MutableRefObject<HTMLDivElement>;
  teacherCameraStream: EduStreamUI | undefined;
}) => {
  const [toolVisible, setToolVisible] = useState(true);
  const toolVisibleTaskRef = useRef<Scheduler.Task>();
  const toolVisibleRef = useRef<boolean>(true);
  const toggleTool = () => {
    toolVisibleTaskRef.current?.stop();
    setToolVisible(!toolVisibleRef.current);
  };
  const showTool = () => {
    toolVisibleTaskRef.current?.stop();
    setToolVisible(true);
    toolVisibleTaskRef.current = Scheduler.shared.addDelayTask(() => {
      setToolVisible(false);
    }, 4000);
  };
  useEffect(() => {
    toolVisibleRef.current = toolVisible;
  }, [toolVisible]);
  useEffect(() => {
    showTool();
    triggerRef?.current?.addEventListener('click', toggleTool);

    return () => {
      toolVisibleTaskRef.current?.stop();
      triggerRef?.current?.removeEventListener('click', toggleTool);
    };
  }, [teacherCameraStream]);
  return {
    toolVisible,
    showTool,
  };
};
const useMobileStreamDrag = ({
  bounds = 'body',
  isPiP,
  triggerRef,
}: {
  bounds?: string;
  isPiP: boolean;
  triggerRef: MutableRefObject<HTMLDivElement>;
}) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const touchPosRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const cacheRef = useRef({ x: 0, y: 0 });
  const boundsRef = useRef({ top: 0, left: 0, right: 0, bottom: 0 });
  const handleTouchStart = (e: TouchEvent) => {
    const ele = e.targetTouches[0];
    touchPosRef.current = { x: ele.clientX, y: ele.clientY };
    const rect = triggerRef.current.getBoundingClientRect();
    const boundsContainer = document.querySelector(bounds);
    boundsRef.current.top = -rect.top;
    boundsRef.current.bottom = (boundsContainer?.clientHeight || 0) - rect.bottom;
    boundsRef.current.left = -rect.left;
    boundsRef.current.right = (boundsContainer?.clientWidth || 0) - rect.right;
  };

  const handleTouchMove = (e: TouchEvent) => {
    const target = e.targetTouches[0];
    if (target) {
      const { clientX, clientY } = target;

      let diffY = clientY - touchPosRef.current.y;
      if (diffY <= boundsRef.current.top) {
        diffY = boundsRef.current.top;
      }
      if (diffY >= boundsRef.current.bottom) {
        diffY = boundsRef.current.bottom;
      }
      let diffX = clientX - touchPosRef.current.x;
      if (diffX >= boundsRef.current.right) {
        diffX = boundsRef.current.right;
      }
      if (diffX <= boundsRef.current.left) {
        diffX = boundsRef.current.left;
      }
      const newPos = {
        x: posRef.current.x + diffX,
        y: posRef.current.y + diffY,
      };

      cacheRef.current = newPos;
      setPos(newPos);
    }
  };
  const handleTouchEnd = () => {
    posRef.current = cacheRef.current;
  };
  useEffect(() => {
    if (isPiP) {
      triggerRef.current?.addEventListener('touchstart', handleTouchStart);
      triggerRef.current?.addEventListener('touchmove', handleTouchMove);
      triggerRef.current?.addEventListener('touchend', handleTouchEnd);
    } else {
      const newPos = {
        x: 0,
        y: 0,
      };
      setPos(newPos);
      cacheRef.current = newPos;
      posRef.current = newPos;
    }
    return () => {
      triggerRef.current?.removeEventListener('touchstart', handleTouchStart);
      triggerRef.current?.removeEventListener('touchmove', handleTouchMove);
      triggerRef.current?.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPiP]);
  return {
    pos,
  };
};
export const RoomBigTeacherStreamH5Container: FC = observer(() => {
  const {
    streamUIStore,
    shareUIStore: { isLandscape, setForceLandscape },
  } = useLectureH5UIStores() as EduLectureH5UIStore;
  const { teacherCameraStream, teacherVideoStreamSize, streamLayoutContainerCls, isPiP, setIsPiP } =
    streamUIStore;
  const ref = useRef<HTMLDivElement>(null);

  const { showTool, toolVisible } = useMobileStreamTool({
    triggerRef: ref as MutableRefObject<HTMLDivElement>,
    teacherCameraStream,
  });
  const { pos } = useMobileStreamDrag({
    isPiP,
    triggerRef: ref as MutableRefObject<HTMLDivElement>,
  });
  const onLandspce = () => {
    setForceLandscape(true);
  };
  const onPip = () => {
    setIsPiP(!isPiP);
  };

  useEffect(() => {
    showTool();
  }, [isPiP]);

  return teacherCameraStream && !teacherCameraStream.isCameraMuted ? (
    <div
      ref={ref}
      className={classnames(
        'relative',
        streamLayoutContainerCls,
        'fcr-stream-h5',
        isPiP && 'fcr-stream-h5-draggable',
      )}
      style={{
        ...teacherVideoStreamSize,
        transform: `translate3d(${pos.x}px,${pos.y}px,0)`,
      }}>
      <RoomBigTeacherStreamH5Tool
        visible={toolVisible && !isLandscape}
        size={isPiP ? 'sm' : 'lg'}
        onLandscape={onLandspce}
        onPip={onPip}></RoomBigTeacherStreamH5Tool>
      <StreamPlayerH5
        stream={teacherCameraStream}
        style={{
          width: '100%',
          height: '100%',
          position: isPiP ? 'static' : 'relative',
        }}
      />
    </div>
  ) : null;
});

export const RoomBigStudentStreamsH5Container: FC = observer(() => {
  const {
    streamUIStore,
    boardUIStore: { containerH5VisibleCls: addtionalContainerH5VisibleCls },
  } = useLectureH5UIStores() as EduLectureH5UIStore;
  const {
    studentVideoStreamSize,

    studentCameraStreams,
    containerH5VisibleCls,
    studentVideoStreamContainerHeight,
    containerH5Extend,
  } = streamUIStore;
  return (
    <div
      className={classnames(
        'items-center',
        'overflow-x-auto',
        containerH5Extend,
        containerH5VisibleCls,
        addtionalContainerH5VisibleCls,
      )}
      style={{ height: studentVideoStreamContainerHeight }}>
      <div className={classnames('items-center', 'flex-row', 'flex')}>
        {studentCameraStreams.map((stream) => {
          return (
            <StreamPlayerH5
              style={{
                width: studentVideoStreamSize.width,
                height: studentVideoStreamSize.height,
                position: 'relative',
                flexShrink: 0,
              }}
              stream={stream}></StreamPlayerH5>
          );
        })}
      </div>
    </div>
  );
});

export const H5RoomPlaceholder = observer(() => {
  const {
    streamUIStore: { teacherCameraStream },
    boardUIStore: { boardContainerHeight, mounted },
    classroomStore: {
      roomStore: {
        classroomSchedule: { startTime, duration },
      },
    },
  } = useLectureH5UIStores();
  const endTime = startTime || 0 + ((duration && duration * 1000) || 0);
  return !teacherCameraStream && !mounted ? (
    <div className="fcr-h5-room-placeholder" style={{ height: boardContainerHeight }}>
      <p>
        {transI18n('fcr_copy_room_id')} {EduClassroomConfig.shared.sessionInfo.roomUuid}
      </p>
      <h3>{EduClassroomConfig.shared.sessionInfo.roomName}</h3>
      <p>
        {dayjs(startTime).format('YYYY.MM.DD HH:mm')}-{dayjs(endTime).format('HH:mm')}
      </p>
    </div>
  ) : null;
});
