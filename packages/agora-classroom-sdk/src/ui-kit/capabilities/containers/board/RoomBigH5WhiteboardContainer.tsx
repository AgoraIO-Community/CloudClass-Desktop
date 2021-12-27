import { observer } from 'mobx-react';
import { FC, useMemo, useEffect } from 'react';
import { useLectureH5UIStores } from '~hooks/use-edu-stores';
import { EduLectureH5UIStore } from '@/infra/stores/lecture-h5';
import 'video.js/dist/video-js.css';
import '@netless/window-manager/dist/style.css';
import { BoardPlaceHolder, Icon, IconTypes } from '~ui-kit';
import classnames from 'classnames';
import './index.css';

import { WhiteboardToolbar } from '~containers/toolbar';

export const WhiteboardH5Container: FC = observer(({ children }) => {
  const { boardUIStore } = useLectureH5UIStores() as EduLectureH5UIStore;
  const {
    readyToMount,
    mount,
    unmount,
    rejoinWhiteboard,
    connectionLost,
    joinWhiteboardWhenConfigReady,
    leaveWhiteboard,
    iconBorderZoomType,
    iconZoomVisibleCls,
    whiteboardContainerCls,
    handleBoradZoomStatus,
    boardContainerHeight,
  } = boardUIStore;

  useEffect(() => {
    joinWhiteboardWhenConfigReady();
    return () => {
      leaveWhiteboard();
    };
  }, [leaveWhiteboard, joinWhiteboardWhenConfigReady]);

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
      className={classnames('w-full relative', whiteboardContainerCls)}
      style={{ height: boardContainerHeight }}>
      {/* <WhiteboardTrackArea/> */}
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
            <WhiteboardToolbar />
          </div>
        </div>
      ) : null}
      <Icon
        type={iconBorderZoomType as IconTypes}
        size={18}
        className={classnames('stream-zoom-status', iconZoomVisibleCls)}
        onClick={handleBoradZoomStatus}
      />
    </div>
  );
});
