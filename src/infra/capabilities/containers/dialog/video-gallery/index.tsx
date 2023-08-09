import React from 'react';
import { useStore } from '@classroom/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { Rnd } from 'react-rnd';
import { SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';
import { useDraggableDefaultCenterPosition } from '@classroom/ui-kit/utilities/hooks';
import { ForceDirection, useDragAnalyzer, useVideoPage } from './hooks';
import { TrackPlayer } from '../../stream/track-player';
import { Pager, Props as PagerProps } from './pager';
import { Setting, Props as SettingProps } from './setting';
import './index.css';
import classNames from 'classnames';
import { EduStreamUI } from '@classroom/infra/stores/common/stream/struct';
import { EduRoleTypeEnum, EduRteEngineConfig, EduRteRuntimePlatform } from 'agora-edu-core';
import { range } from 'lodash';
import { PlaceholderStateColors } from '@classroom/ui-kit/utilities/state-color';

interface VideoGalleryProps {
  id: string;
}

const bounds = '.classroom-track-bounds';

const constraints = {
  minHeight: 380,
  minWidth: 675,
};

const defaults = {
  modalWidth: 675,
  modalHeight: 380,
  detectMovement: 100,
};

export const VideoGallery: FC<VideoGalleryProps> = observer(({ id }) => {
  const {
    handUpUIStore: { onPodium, offPodium },
    shareUIStore: { removeDialog, navHeight },
    videoGalleryUIStore,
  } = useStore();
  const transI18n = useI18n();

  const rndRef = useRef<Rnd>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const windowCacheBounds = useRef({ width: 0, height: 0, x: 0, y: 0 });

  const handleClose = useCallback(() => {
    removeDialog(id);
    videoGalleryUIStore.setOpen(false);
  }, [id]);

  useEffect(() => {
    videoGalleryUIStore.setOpen(true, id);
  }, []);

  const handleFullscreen = useCallback(() => {
    let containerEl = document.querySelector(bounds);
    if (isFullscreen) {
      const { x, y, width, height } = windowCacheBounds.current;
      rndRef.current?.updatePosition({ x, y });

      rndRef.current?.updateSize({
        width,
        height,
      });
    } else {
      if (containerEl) {
        const fixOffset = navHeight;
        const ele = rndRef.current?.getSelfElement();
        const { x, y } = rndRef.current?.getDraggablePosition() || { x: 0, y: 0 };

        if (ele) {
          windowCacheBounds.current = {
            width: ele.clientWidth,
            height: ele.clientHeight,
            x,
            y,
          };
        }

        rndRef.current?.updatePosition({ x: 0, y: fixOffset });

        rndRef.current?.updateSize({
          width: containerEl.clientWidth,
          height: containerEl.clientHeight,
        });
      }
    }
    setIsFullscreen((v) => !v);
  }, [isFullscreen]);

  const handleDragOut = useCallback((forceDirection: ForceDirection) => {
    if (EduRteEngineConfig.platform === EduRteRuntimePlatform.Electron) {
      removeDialog(id);

      videoGalleryUIStore.openExternalWindow();
    }
  }, []);

  const { streamList } = useVideoPage();

  const defaultRect = useDraggableDefaultCenterPosition({
    draggableWidth: defaults.modalWidth,
    draggableHeight: defaults.modalHeight,
    bounds,
  });

  const { eventHandlers } = useDragAnalyzer({
    bounds,
    rnd: rndRef,
    onDragOutDetect: handleDragOut,
    detectMovement: defaults.detectMovement,
  });

  const {
    videoGalleryConfigOptions,
    setPageSize,
    pageSize,
    curPage,
    totalPageNum,
    nextPage,
    prevPage,
    stageUserUuids,
  } = videoGalleryUIStore;

  const renderVideo = useCallback((stream: EduStreamUI) => <TrackPlayer stream={stream} />, []);

  return (
    <Rnd
      style={{ display: 'none' }}
      ref={rndRef}
      dragHandleClassName="main-title"
      enableResizing={false}
      default={defaultRect}
      bounds={bounds}
      {...constraints}
      {...eventHandlers}>
      {/* modal */}
      <div className="fcr-video-grid fcr-w-full fcr-h-full fcr-flex fcr-flex-col">
        {/* close */}
        <div className="btn-pin">
          <SvgImg
            type={isFullscreen ? SvgIconEnum.FULLSCREEN_SHRINK : SvgIconEnum.FULLSCREEN}
            className="fcr-cursor-pointer"
            size={20}
            style={{ marginRight: 12 }}
            onClick={handleFullscreen}
          />
          <SvgImg
            type={SvgIconEnum.CLOSE}
            className="fcr-cursor-pointer"
            onClick={handleClose}
            size={20}
          />
        </div>
        {/* title */}
        <div className="main-title">
          {transI18n('fcr_expansion_screen_button_expansion_screen')}
        </div>
        {/* content */}
        <VideoGalleryPortal
          className="main-content fcr-h-full"
          streamList={streamList}
          options={videoGalleryConfigOptions}
          pageSize={pageSize}
          setPageSize={setPageSize}
          curPage={curPage}
          nextPage={nextPage}
          prevPage={prevPage}
          totalPageNum={totalPageNum}
          renderVideo={renderVideo}
          stageUserUuids={stageUserUuids}
          onStageClick={onPodium}
          offStageClick={offPodium}
        />
      </div>
    </Rnd>
  );
});

type PortalProps = {
  className: string;
  streamList: EduStreamUI[];
} & SettingProps &
  PagerProps &
  StageHoverProps;

export const VideoGalleryPortal: FC<PortalProps> = ({
  className,
  streamList,
  options,
  pageSize,
  setPageSize,
  curPage,
  nextPage,
  prevPage,
  totalPageNum,
  renderVideo,
  stageUserUuids,
  onStageClick,
  offStageClick,
}) => {
  const containerCls = classNames(className, 'fcr-video-grid-portal fcr-flex-grow fcr-relative');

  const list = useMemo(() => {
    return range(0, pageSize).map((n) => streamList[n]);
  }, [pageSize, streamList]);

  const pagerVisible = totalPageNum > 1;

  return (
    <div className={containerCls}>
      <Setting pageSize={pageSize} setPageSize={setPageSize} options={options} />
      {pagerVisible && (
        <Pager
          curPage={curPage}
          nextPage={nextPage}
          prevPage={prevPage}
          totalPageNum={totalPageNum}
        />
      )}
      {/* video grid */}
      <div className="fcr-video-grid-wrap">
        {list.map((stream, i) => (
          <StageHover
            key={i}
            index={i}
            total={list.length}
            stream={stream}
            pageSize={pageSize}
            renderVideo={renderVideo}
            stageUserUuids={stageUserUuids}
            onStageClick={onStageClick}
            offStageClick={offStageClick}
          />
        ))}
      </div>
    </div>
  );
};

type StageHoverProps = {
  renderVideo: (stream: EduStreamUI) => React.ReactElement;
  stageUserUuids: string[];
  onStageClick: (userUuid: string) => void;
  offStageClick: (userUuid: string) => void;
};
type StageHoverItemProps = {
  stream: EduStreamUI;
  index: number;
  total: number;
  pageSize: number;
};

const StageHover: FC<StageHoverProps & StageHoverItemProps> = ({
  pageSize,
  stageUserUuids,
  onStageClick,
  offStageClick,
  renderVideo,
  stream,
  index,
  total,
}) => {
  const t = useI18n();

  const needSize = useMemo(() => {
    return Math.floor(Math.sqrt(pageSize));
  }, [pageSize]);

  const [hovered, setHovered] = useState(false);
  const transI18n = useI18n();

  const gridSize = `${100 / needSize}%`;

  const renderPlaceholder = useCallback(() => {
    return (
      <div className="fcr-video-grid-podium-status">
        <SvgImg
          style={{ height: '27%' }}
          size="100%"
          type={SvgIconEnum.GOOFFSTAGE}
          colors={{ iconPrimary: PlaceholderStateColors.normal }}
        />
        <span style={{ fontSize: 12, color: '#97BAF9' }}>
          {transI18n('fcr_expansion_screen_tips_student_on_stage')}
        </span>
      </div>
    );
  }, []);

  const handleClick = (userUuid: string) => () => {
    if (stageUserUuids.includes(userUuid)) {
      offStageClick(userUuid);
    } else {
      onStageClick(userUuid);
    }
  };

  const handleMouseHover = (hovered: boolean) => () => {
    setHovered(hovered);
  };

  const hoverLayerStyle = useSpring({
    to: hovered ? { opacity: 1 } : { opacity: 0 },
  });

  const style = {
    width: gridSize,
    height: gridSize,
  } as React.CSSProperties;

  let cls = classNames('fcr-overflow-hidden', 'fcr-video-grid-border', 'fcr-relative');

  //
  if ((index + 1) % needSize !== 0) {
    style.borderRightWidth = 1;
    style.borderRightStyle = 'solid';
  }
  //
  if (index < total - needSize) {
    style.borderBottomWidth = 1;
    style.borderBottomStyle = 'solid';
  }

  if (!stream) {
    return <div className={cls} style={style} />;
  }

  const opText = stageUserUuids.includes(stream.fromUser.userUuid)
    ? t('fcr_expansion_screen_button_down')
    : t('fcr_expansion_screen_button_on');

  const showStageButton = EduRoleTypeEnum.student === stream.role;

  const isOnStage = stageUserUuids.includes(stream.fromUser.userUuid);
  const stageIcon = isOnStage ? SvgIconEnum.GOOFFSTAGE : SvgIconEnum.GOONSTAGE;

  return (
    <div
      className={cls}
      style={style}
      key={stream.stream.streamUuid}
      onMouseEnter={handleMouseHover(true)}
      onMouseLeave={handleMouseHover(false)}>
      {isOnStage ? renderPlaceholder() : renderVideo(stream)}
      {showStageButton && (
        <animated.div
          style={hoverLayerStyle}
          className="fcr-video-grid-button"
          onClick={handleClick(stream.fromUser.userUuid)}>
          <SvgImg type={stageIcon} colors={{ iconPrimary: 'rgba(255,255,255,0.87)' }} />
          <span>{opText}</span>
        </animated.div>
      )}
      <span className="fcr-video-grid-nameplate fcr-absolute">{stream.fromUser.userName}</span>
    </div>
  );
};
