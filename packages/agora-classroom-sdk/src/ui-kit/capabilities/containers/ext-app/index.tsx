import { observer } from 'mobx-react';
import React, { useEffect, useRef } from 'react';
import {
  IAgoraExtApp,
  useAppPluginContext,
  useRoomContext,
  useSmallClassVideoControlContext,
} from 'agora-edu-core';
import Draggable from 'react-draggable';
import { Dependencies } from './dependencies';
import { eduSDKApi } from 'agora-edu-core';
import { Modal, transI18n, Z_INDEX_CONST } from '~ui-kit';
import { EduRoleTypeEnum } from 'agora-edu-core';
// import { transI18n } from '~components/i18n';

export const AppPluginItem = observer(
  ({
    app,
    properties,
    closable,
    onCancel,
  }: {
    app: IAgoraExtApp;
    properties: any;
    closable: boolean;
    onCancel: any;
  }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const { contextInfo } = useAppPluginContext();

    const {
      userUuid,
      userName,
      userRole,
      roomName,
      roomUuid,
      roomType,
      language,
    } = contextInfo;

    useEffect(() => {
      if (ref.current) {
        // only run for very first time
        app.extAppDidLoad(
          ref.current,
          {
            properties: properties,
            dependencies: Dependencies,
            localUserInfo: {
              userUuid: userUuid,
              userName: userName,
              roleType: userRole,
            },
            roomInfo: {
              roomName,
              roomUuid,
              roomType,
            },
            language: language,
          },
          {
            updateRoomProperty: async (
              properties: any,
              common: any,
              cause: {},
            ) => {
              return await eduSDKApi.updateExtAppProperties(
                roomUuid,
                app.appIdentifier,
                properties,
                common,
                cause,
              );
            },
            deleteRoomProperties: async (properties: string[], cause: {}) => {
              return await eduSDKApi.deleteExtAppProperties(
                roomUuid,
                app.appIdentifier,
                properties,
                cause,
              );
            },
          },
        );
      }
      return () => app.extAppWillUnload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, app]);
    const { studentStreams } = useSmallClassVideoControlContext();
    return (
      <Draggable
        handle=".modal-title"
        defaultPosition={{
          x: window.innerWidth / 2 - app.width / 2,
          y: window.innerHeight / 2 - app.height / 2,
        }}
        bounds={'body'}>
        <Modal
          title={transI18n(`${app.appName}.appName`)}
          width={app.width}
          onCancel={onCancel}
          hasMask={false}
          closable={closable}>
          <div
            ref={ref}
            style={{
              width: '100%',
              height: app.height,
              overflow: 'hidden',
              transition: '.5s',
            }}></div>
        </Modal>
      </Draggable>
    );
  },
);

export const AppPluginContainer = observer(() => {
  const {
    activeAppPlugins,
    appPluginProperties,
    onShutdownAppPlugin,
    contextInfo,
  } = useAppPluginContext();
  const { roomInfo } = useRoomContext();
  const closable = roomInfo.userRole === EduRoleTypeEnum.teacher; // 老师能关闭， 学生不能关闭
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        zIndex: Z_INDEX_CONST.zIndexExtApp,
      }}>
      {Array.from(activeAppPlugins.values()).map(
        (app: IAgoraExtApp, idx: number) => (
          <AppPluginItem
            key={app.appIdentifier}
            app={app}
            properties={appPluginProperties(app)}
            closable={closable}
            onCancel={async () => {
              await eduSDKApi.updateExtAppProperties(
                contextInfo.roomUuid,
                app.appIdentifier,
                {
                  state: '0',
                  startTime: '0',
                  pauseTime: '0',
                  duration: '0',
                },
                {
                  state: 0,
                },
                {},
              );
              onShutdownAppPlugin(app.appIdentifier);
            }}></AppPluginItem>
        ),
      )}
    </div>
  );
});
