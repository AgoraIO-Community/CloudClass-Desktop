import {
  useBoardContext,
  useGlobalContext,
  useRoomContext,
  Resource,
  useScreenShareContext,
  useCloudDriveContext,
  RoomPhase,
} from 'agora-edu-core';
import { ZoomItemType } from '~ui-kit/components';
import { EduRoleTypeEnum, EduRoomType } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useCallback, useMemo } from 'react';
import { ColorsContainer } from '~capabilities/containers/board/colors';
import { PensContainer } from '~capabilities/containers/board/pens';
import { ToolCabinetContainer } from '~capabilities/containers/board/tool-cabinet';
import {
  CloseConfirm,
  StudentUserListDialog,
  UserListDialog,
} from '~capabilities/containers/dialog';
import { CloudDriverContainer } from '~capabilities/containers/board/cloud-driver';
import {
  Icon,
  TabPane,
  Tabs,
  Toolbar,
  ToolItem,
  transI18n,
  ZoomController,
  SvgImg,
  BoardPlaceHolder,
} from '~ui-kit';
import { useEffect } from 'react';
import classnames from 'classnames';
import { useUIStore } from '@/infra/hooks';
import 'video.js/dist/video-js.css';

export const allTools: ToolItem[] = [
  {
    // clicker use selector icon
    value: 'clicker',
    label: 'scaffold.clicker',
    icon: 'select',
  },
  {
    // selector use clicker icon
    value: 'selection',
    label: 'scaffold.selector',
    icon: 'clicker',
  },
  {
    value: 'pen',
    label: 'scaffold.pencil',
    icon: 'pen',
    component: (props: any) => {
      return <PensContainer {...props} />;
    },
  },
  {
    value: 'text',
    label: 'scaffold.text',
    icon: 'text',
  },
  {
    value: 'eraser',
    label: 'scaffold.eraser',
    icon: 'eraser',
  },
  {
    value: 'color',
    label: 'scaffold.color',
    icon: 'circle',
    component: (props: any) => {
      return <ColorsContainer {...props} />;
    },
  },
  {
    value: 'blank-page',
    label: 'scaffold.blank_page',
    icon: 'blank-page',
  },
  {
    value: 'hand',
    label: 'scaffold.move',
    icon: 'hand',
  },
  {
    value: 'cloud',
    label: 'scaffold.cloud_storage',
    icon: 'cloud',
    // component: () => {
    //   return <CloudDiskContainer />
    // }
  },
  {
    value: 'tools',
    label: 'scaffold.tools',
    icon: 'tools',
    component: () => {
      return <ToolCabinetContainer />;
    },
  },
  {
    value: 'register',
    label: 'scaffold.user_list',
    icon: 'register',
  },
  {
    value: 'student_list',
    label: 'scaffold.student_list',
    icon: 'register',
  },
];

export type WhiteBoardState = {
  zoomValue: number;
  currentPage: number;
  totalPage: number;

  items: ToolItem[];
  handleToolBarChange: (evt: any) => Promise<any> | any;
  handleZoomControllerChange: (e: any) => Promise<any> | any;
};

const TabsContainer = observer(() => {
  const { changeSceneItem, activeSceneName } = useBoardContext();

  const { resourcesList } = useCloudDriveContext();

  const { addDialog } = useUIStore();

  const { isScreenSharing } = useScreenShareContext();

  const TabPaneIcon = useCallback(
    (name: string, resourceUuid: string, key: number) => {
      const panelCls = classnames({
        [`icon-share-active`]: !!isScreenSharing === true,
        [`icon-share-inactive`]: !!isScreenSharing === false,
      });

      if (key === 0) {
        return (
          <>
            <SvgImg type="whiteboard" />
            {transI18n('tool.board_name')}
          </>
        );
      }

      if (resourceUuid === 'screenShare') {
        return (
          <>
            <SvgImg className={panelCls} type="share-screen" />
            {transI18n('tool.screen_share')}
          </>
        );
      }

      return <>{name}</>;
    },
    [isScreenSharing],
  );

  return (
    <Tabs
      className="material-menu"
      activeKey={activeSceneName}
      type="editable-card"
      onChange={changeSceneItem}>
      {resourcesList.map((item: Resource, key: number) => (
        <TabPane
          key={item.resourceUuid}
          tab={TabPaneIcon(item.file.name, item.resourceUuid, key)}
          closeIcon={
            <SvgImg
              type="close"
              onClick={() => {
                addDialog(CloseConfirm, {
                  resourceUuid: item.resourceUuid,
                });
              }}
            />
          }
          closable={key !== 0}></TabPane>
      ))}
    </Tabs>
  );
});

export const WhiteboardContainer = observer(({ children }: any) => {
  const { addDialog } = useUIStore();

  const { isFullScreen } = useGlobalContext();

  const { roomInfo } = useRoomContext();

  const {
    zoomValue,
    currentPage,
    totalPage,
    ready,
    currentSelector,
    activeMap,
    tools,
    hasPermission,
    mountToDOM,
    zoomBoard,
    setZoomScale,
    changeFooterMenu,
    setTool,
    installTools,
    showBoardTool,
    boardConnectionState,
    joinBoard,
  } = useBoardContext();

  const handleToolClick = (type: string) => {
    console.log('handleToolClick tool click', type);
    switch (type) {
      case 'cloud': {
        setTool(type);
        addDialog(CloudDriverContainer);
        break;
      }
      case 'register': {
        setTool(type);
        addDialog(UserListDialog);
        break;
      }
      case 'student_list': {
        setTool(type);
        addDialog(StudentUserListDialog);
        break;
      }
      default: {
        setTool(type);
        break;
      }
    }
  };

  useEffect(() => {
    installTools(allTools);
  }, [allTools]);

  const showTab = roomInfo.userRole === EduRoleTypeEnum.student ? false : true;

  const [showToolBar, showZoomControl] = showBoardTool;

  // const [showToolBar, showZoomControl] = useMemo(() => {
  //   if ([EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(roomInfo.userRole)) {
  //     return [true, true]
  //   }
  //   if (roomInfo.roomType === EduRoomType.SceneType1v1 && roomInfo.userRole === EduRoleTypeEnum.student) {
  //     return [true, hasPermission]
  //   }

  //   if ([EduRoomType.SceneTypeMiddleClass, EduRoomType.SceneTypeBigClass].includes(roomInfo.roomType) && roomInfo.userRole === EduRoleTypeEnum.student) {
  //     return [true, hasPermission]
  //   }

  //   return [false, false]
  // }, [roomInfo.roomType, hasPermission, roomInfo.userRole, roomInfo.roomType, isShareScreen])

  const handleZoomControllerChange = async (type: ZoomItemType) => {
    const toolbarMap: Record<ZoomItemType, CallableFunction> = {
      max: () => {
        zoomBoard('fullscreen');
      },
      min: () => {
        zoomBoard('fullscreenExit');
      },
      'zoom-out': () => {
        setZoomScale('out');
      },
      'zoom-in': () => {
        setZoomScale('in');
      },
      forward: () => changeFooterMenu('next_page'),
      backward: () => changeFooterMenu('prev_page'),
    };
    toolbarMap[type] && toolbarMap[type]();
  };

  const isBoardConnected = useMemo(
    () => boardConnectionState !== RoomPhase.Disconnected,
    [boardConnectionState],
  );

  return (
    <div className="whiteboard">
      {isBoardConnected ? (
        <>
          {showTab ? <TabsContainer /> : null}
          <div className="board-section">
            {children}
            {ready ? <div id="netless" ref={mountToDOM}></div> : null}
          </div>
          {showToolBar ? (
            <Toolbar
              active={currentSelector}
              activeMap={activeMap}
              tools={tools}
              onClick={handleToolClick}
              className="toolbar-biz"
              defaultOpened={roomInfo.userRole === EduRoleTypeEnum.student ? false : true}
            />
          ) : null}
          {showZoomControl ? (
            <ZoomController
              className="zoom-position"
              zoomValue={zoomValue}
              currentPage={currentPage}
              totalPage={totalPage}
              maximum={!isFullScreen}
              clickHandler={handleZoomControllerChange}
            />
          ) : null}
        </>
      ) : (
        <BoardPlaceHolder
          onReconnectClick={async () => {
            try {
              await joinBoard();
            } catch (e) {
              console.log('重新连接白板错误', e);
            }
          }}
        />
      )}
    </div>
  );
});
