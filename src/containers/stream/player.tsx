import { useStore } from '@classroom/hooks/ui-store';
import { LocalTrackPlayerContainer, StreamPlayer } from '.';
import { FC, MutableRefObject, useContext, useEffect, useRef, useState } from 'react';
import { EduClassroomConfig, EduStream } from 'agora-edu-core';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import dayjs from 'dayjs';
import { Scheduler } from 'agora-rte-sdk';
import { EduStreamUI } from '@classroom/uistores/stream/struct';
import { useI18n } from 'agora-common-libs';
import './index.css';
import Award from '../award';
import { MicrophoneIndicator } from '../action-sheet/mic';
import { StreamContext, convertStreamUIStatus } from './context';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
const TeacherStreamH5Tool = ({
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
export const useMobileStreamTool = ({
  triggerRef,
  teacherCameraStream,
}: {
  triggerRef: MutableRefObject<HTMLDivElement>;
  teacherCameraStream?: EduStreamUI | undefined;
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
    // showTool();
    triggerRef?.current?.addEventListener('click', toggleTool);
    return () => {
      toolVisibleTaskRef.current?.stop();
      triggerRef?.current?.removeEventListener('click', toggleTool);
    };
  });
  return {
    toolVisible,
    showTool,
  };
};
export const useMobileStreamDrag = ({
  bounds = 'body',
  isPiP,
  triggerRef,
  type,
}: {
  bounds?: string;
  isPiP: boolean;
  triggerRef: MutableRefObject<HTMLDivElement>;
  type:string;
}) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const touchPosRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const cacheRef = useRef({ x: 0, y: 0 });
  const boundsRef = useRef({ top: 0, left: 0, right: 0, bottom: 0 });
  const initData = () => {
    const newPos = {
      x: 0,
      y: 0,
    };
    setPos(newPos);
    cacheRef.current = newPos;
    posRef.current = newPos;
  };
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
    e.preventDefault();

    const target = e.targetTouches[0];
    if (target) {
      const { clientX, clientY } = target;
      const teacherView = "teacherView" == type;
      let diffY = clientY - touchPosRef.current.y;
      if (diffY <= boundsRef.current.top) {
        diffY = boundsRef.current.top;
      }
      if (diffY >= boundsRef.current.bottom - (teacherView ? 0 : 160)) {
        diffY = boundsRef.current.bottom - (teacherView ? 0 : 160);
      }
      let diffX = clientX - touchPosRef.current.x;
      if (diffX >= boundsRef.current.right - (teacherView ? 0 : 130)) {
        diffX = boundsRef.current.right - (teacherView ? 0 : 130);
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
    initData,
  };
};
export const TeacherStreamContainer = observer(({ stream }: { stream: EduStreamUI }) => {
  const {
    streamUIStore,
    shareUIStore: { isLandscape, setForceLandscape },
    layoutUIStore: { toggleLandscapeToolBarVisible },
  } = useStore();
  const {
    teacherVideoStreamSize,
    streamLayoutContainerCls,
    isPiP,
    setIsPiP,
    toolVisible,
    toggleTool,
    showTool,
  } = streamUIStore;
  const userName = stream.fromUser.userName;
  const ref = useRef<HTMLDivElement>(null);
  const { pos } = useMobileStreamDrag({
    isPiP,
    triggerRef: ref as MutableRefObject<HTMLDivElement>,
    type:"teacherView"
  });
  const onLandspce = () => {
    setForceLandscape(true);
  };
  const onPiP = () => {
    setIsPiP(!isPiP);
  };
  useEffect(() => {
    // if (isPiP) {
    showTool();
    // }
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
      <div
        className="fcr-stream-mobile-name"
        style={{
          opacity: toolVisible && !isLandscape ? 1 : 0,
          visibility: toolVisible && !isLandscape ? 'visible' : 'hidden',
        }}>
        {userName || 'teacher'}
      </div>
      <TeacherStreamH5Tool
        isPiP={isPiP}
        visible={toolVisible && !isLandscape}
        size={isPiP ? 'sm' : 'lg'}
        onLandscape={onLandspce}
        onPiP={onPiP}></TeacherStreamH5Tool>
      {/* <div onClick={toggleTool} style={{ width: '100%', height: '100%' }}> */}
      <StreamPlayer
        onClick={() => {
          toggleTool();
          toggleLandscapeToolBarVisible();
        }}
        stream={stream}
        style={{
          width: '100%',
          height: '100%',
          position: isPiP ? 'static' : 'relative',
        }}
      />
      {/* </div> */}
    </div>
  );
});

export const AudioRecordinDeviceIcon = observer(
  ({ size = 32, stream }: { size?: number; stream: EduStreamUI }) => {
    const {
      streamUIStore: { remoteStreamVolume, localVolume },
    } = useStore();
    const isLocalStream = !!stream?.stream.isLocal;
    const isMicMuted = !!stream?.isMicMuted;
    const volume = isLocalStream ? localVolume : remoteStreamVolume(stream);
    return (
      <div style={{ flexShrink: 0 }}>
        {isMicMuted ? (
          <SvgImg
            type={SvgIconEnum.UNMUTE_MOBILE}
            size={20}
            colors={{ iconPrimary: '#F5655C' }}></SvgImg>
        ) : (
          <MicrophoneIndicator size={size} voicePercent={volume} />
        )}
      </div>
    );
  },
);

export const RoomPlaceholder = observer(() => {
  const {
    streamUIStore: { teacherCameraStream, screenShareStream },
    layoutUIStore: { classRoomPlacholderHeight, classRoomPlacholderIngroupHeight },
    boardUIStore: { mounted, isGrantedBoard },
    groupUIStore: { isInGroup },
    getters: { isBoardWidgetActive, isMediaPlayerWidgetActive, isWebViewWidgetActive },
    classroomStore: {
      roomStore: {
        classroomSchedule: { startTime, duration },
      },
    },
  } = useStore();
  const transI18n = useI18n();

  const endTime = (startTime || 0) + ((duration && duration * 1000) || 0);
  return (!teacherCameraStream || teacherCameraStream.isCameraMuted) &&
    !isBoardWidgetActive &&
    !isMediaPlayerWidgetActive &&
    !isWebViewWidgetActive &&
    !screenShareStream ? (
    !isInGroup ? (
      <div className="fcr-mobile-room-placeholder" style={{ height: '190px'}}>
        <p>
          {transI18n('fcr_copy_room_id')} {EduClassroomConfig.shared.sessionInfo.roomUuid}
        </p>
        <h3>{EduClassroomConfig.shared.sessionInfo.roomName}</h3>
        <p>
          {dayjs(startTime).format('YYYY.MM.DD HH:mm')}-{dayjs(endTime).format('HH:mm')}
        </p>
      </div>
    ) : (
      <div
        style={{
          height: classRoomPlacholderIngroupHeight,
        }}></div>
    )
  ) : null;
});
