import { observer } from 'mobx-react';
import { FC, useMemo, useEffect } from 'react';
import { useLectureH5UIStores } from '~hooks/use-edu-stores';
import { EduLectureH5UIStore } from '@/infra/stores/lecture-h5';
import { useStore } from '~hooks/use-edu-stores';
import { TrackArea } from '~containers/root-box/';
import 'video.js/dist/video-js.css';
import '@netless/window-manager/dist/style.css';
import { BoardPlaceHolder, Icon, IconTypes } from '~ui-kit';
import classnames from 'classnames';
import './index.css';

type Props = {
  children?: React.ReactNode;
};

export const WhiteboardH5Container: FC<Props> = observer(({ children }) => {
  const {
    boardUIStore,
    streamUIStore: { containerH5VisibleCls },
  } = useLectureH5UIStores() as EduLectureH5UIStore;
  const {
    readyToMount,
    mount,
    unmount,
    rejoinWhiteboard,
    connectionLost,
    joinWhiteboard,
    leaveWhiteboard,
    iconBorderZoomType,
    iconZoomVisibleCls,
    handleBoradZoomStatus,
    boardContainerHeight,
    boardContainerWidth,
  } = boardUIStore;

  useEffect(() => {
    joinWhiteboard();
    return () => {
      leaveWhiteboard();
    };
  }, [leaveWhiteboard, joinWhiteboard]);

  const boardContainer = useMemo(
    () => (
      <div
        id="netless"
        ref={(dom) => {
          if (dom) {
            mount(dom);
          } else {
            unmount();
          }
        }}></div>
    ),
    [mount, unmount],
  );

  return (
    <div
      className={classnames('whiteboard-h5-container w-full relative', containerH5VisibleCls)}
      style={{ height: boardContainerHeight, width: boardContainerWidth }}>
      <WhiteboardTrackArea />
      {readyToMount ? (
        <div className="whiteboard-wrapper">
          {children}
          <div className="whiteboard">
            {boardContainer}
            {connectionLost ? (
              <BoardPlaceHolder
                style={{ position: 'absolute' }}
                onReconnectClick={rejoinWhiteboard}
              />
            ) : null}
          </div>
        </div>
      ) : null}
      <Icon
        type={iconBorderZoomType as IconTypes}
        className={classnames('whiteboard-zoom-status', iconZoomVisibleCls)}
        onClick={handleBoradZoomStatus}
      />
    </div>
  );
});

export const WhiteboardTrackArea = () => {
  const { boardUIStore } = useStore();
  const { readyToMount } = boardUIStore;
  return readyToMount ? <TrackArea boundaryName="extapp-track-bounds" /> : null;
};
