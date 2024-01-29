import { useLectureH5UIStores } from '@classroom/infra/hooks/ui-store';
import { EduLectureH5UIStore } from '@classroom/infra/stores/lecture-mobile';
import { LocalTrackPlayerMobile, StreamPlayerMobile } from './index.mobile';
import { FC, MutableRefObject, useEffect, useRef, useState } from 'react';
import { EduClassroomConfig } from 'agora-edu-core';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { SvgIconEnum, SvgImg, SvgImgMobile } from '@classroom/ui-kit';
import dayjs from 'dayjs';
import { Scheduler } from 'agora-rte-sdk';
import { EduStreamUI } from '@classroom/infra/stores/common/stream/struct';
import { useI18n } from 'agora-common-libs';
import './index.mobile.css';
const RoomBigTeacherStreamH5Tool = ({
  isPiP,
  onPiP,
  onLandscape,
  size,
  visible = false,
}: {
  isPiP: boolean;
  size: 'lg' | 'sm';
  onPiP: () => void;
  onLandscape: () => void;
  visible: boolean;
}) => {
  return (
    <div
      style={{ opacity: visible ? 1 : 0, visibility: visible ? 'visible' : 'hidden' }}
      className={`fcr-stream-mobile-tool-${size}`}>
      <SvgImg
        onClick={onPiP}
        type={isPiP ? SvgIconEnum.PIP_OFF : SvgIconEnum.PIP_ON}
        size={24}></SvgImg>
      {/* <SvgImg onClick={onLandscape} type={SvgIconEnum.LANDSCAPE} size={24}></SvgImg> */}
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
export const RoomBigTeacherStreamContainerMobile = observer(
  ({ teacherCameraStream }: { teacherCameraStream: EduStreamUI }) => {
    const {
      streamUIStore,
      shareUIStore: { isLandscape, setForceLandscape },
      layoutUIStore: { toggleLandscapeToolBarVisible },
    } = useLectureH5UIStores() as EduLectureH5UIStore;
    const { teacherVideoStreamSize, streamLayoutContainerCls, isPiP, setIsPiP } = streamUIStore;
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
    const onPiP = () => {
      setIsPiP(!isPiP);
    };

    useEffect(() => {
      showTool();
    }, [isPiP]);

    return (
      <div
        ref={ref}
        className={classnames(
          'fcr-relative',
          streamLayoutContainerCls,
          'fcr-stream-mobile',
          isPiP && 'fcr-stream-mobile-draggable',
        )}
        style={{
          ...teacherVideoStreamSize,
          transform: `translate3d(${pos.x}px,${pos.y}px,0)`,
        }}>
        <RoomBigTeacherStreamH5Tool
          isPiP={isPiP}
          visible={toolVisible && !isLandscape}
          size={isPiP ? 'sm' : 'lg'}
          onLandscape={onLandspce}
          onPiP={onPiP}></RoomBigTeacherStreamH5Tool>
        <StreamPlayerMobile
          onClick={toggleLandscapeToolBarVisible}
          stream={teacherCameraStream}
          style={{
            width: '100%',
            height: '100%',
            position: isPiP ? 'static' : 'relative',
          }}
        />
      </div>
    );
  },
);

export const RoomBigStudentStreamsContainerMobile: FC = observer(() => {
  const {
    shareUIStore: { isLandscape, forceLandscape },
    streamUIStore,
    boardUIStore: { containerH5VisibleCls: addtionalContainerH5VisibleCls },
  } = useLectureH5UIStores() as EduLectureH5UIStore;
  const {
    studentVideoStreamSize,
    studentCameraStreams,
    containerH5VisibleCls,
    studentVideoStreamContainerHeight,
    containerH5Extend,
    studentStreamsVisible,
    toggleStudentStreamsVisible,
  } = streamUIStore;
  return (
    <div
      className={classnames(
        'fcr-items-center',
        'fcr-relative',
        containerH5Extend,
        containerH5VisibleCls,
        addtionalContainerH5VisibleCls,
      )}
      style={{
        height: studentVideoStreamContainerHeight,
        width: '100vw',
        background: '#F4F4FF',
      }}>
      {studentCameraStreams.length > 0 && (
        <div className="fcr-stream-collapse-mobile">
          <SvgImgMobile
            onClick={toggleStudentStreamsVisible}
            style={{ transform: `rotateX(${studentStreamsVisible ? '0deg' : '180deg'})` }}
            type={SvgIconEnum.COLLAPSE_STREAM_MOBILE}
            size={40}
            landscape={isLandscape}
            forceLandscape={forceLandscape}></SvgImgMobile>
        </div>
      )}

      <div
        className={classnames(
          'fcr-items-center',
          'fcr-flex-row',
          'fcr-flex',
          'fcr-justify-start',
          'fcr-overflow-x-auto',
        )}>
        {studentCameraStreams.map((stream) => {
          const isLocal = stream.stream.isLocal;
          return isLocal ? (
            <LocalTrackPlayerMobile
              key={stream.stream.streamUuid}
              stream={stream}></LocalTrackPlayerMobile>
          ) : (
            <StreamPlayerMobile
              key={stream.stream.streamUuid}
              style={{
                width: studentVideoStreamSize.width,
                height: studentVideoStreamSize.height,
                position: 'relative',
                flexShrink: 0,
              }}
              stream={stream}></StreamPlayerMobile>
          );
        })}
      </div>
    </div>
  );
});

export const H5RoomPlaceholder = observer(() => {
  const {
    streamUIStore: { teacherCameraStream },
    layoutUIStore: { classRoomPlacholderMobileHeight },
    boardUIStore: { mounted },
    classroomStore: {
      roomStore: {
        classroomSchedule: { startTime, duration },
      },
    },
  } = useLectureH5UIStores();
  const transI18n = useI18n();

  const endTime = (startTime || 0) + ((duration && duration * 1000) || 0);
  return (!teacherCameraStream || teacherCameraStream.isCameraMuted) && !mounted ? (
    <div
      className="fcr-mobile-room-placeholder"
      style={{ height: classRoomPlacholderMobileHeight }}>
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
