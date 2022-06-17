import { useStore } from '@/infra/hooks/use-edu-stores';
import {
  AgoraWidgetBase,
  AgoraWidgetController,
  EduClassroomConfig,
  EduRoleTypeEnum,
  iterateMap,
} from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { WidgetTrack } from '../root-box';
import { Modal } from './modal';
import { AgoraWidgetCustomEventType } from 'agora-plugin-gallery';

export const WidgetTrackContiner = observer(() => {
  const {
    classroomStore: {
      widgetStore: { widgetController },
    },
  } = useStore();
  return (
    <div className="w-full h-full absolute widget-container" style={{ left: 0, top: 0, zIndex: 1 }}>
      {widgetController &&
        iterateMap(widgetController.widgetsMap, {
          onFilter: (_key, item) => item.widgetRoomProperties.state === 1,
          onMap: (_key, item) => item,
        }).list.map((w: AgoraWidgetBase) => {
          return (
            <WidgetContainer
              key={w.id}
              widget={w}
              widgetController={widgetController}></WidgetContainer>
          );
        })}
    </div>
  );
});
const WidgetContainer = observer(
  (props: { widget: AgoraWidgetBase; widgetController: AgoraWidgetController }) => {
    const {
      classroomStore: {
        boardStore: { grantUsers },
      },
      widgetUIStore: { setWidgetToFullScreen },
    } = useStore();
    const { widgetController } = props;
    const { id, widgetRoomProperties, track, title } = props.widget as AgoraWidgetBase & {
      title?: string;
    };
    const memo = useMemo(() => {
      return (
        <div
          className={'w-full h-full'}
          ref={(dom) => {
            if (dom) {
              props.widget.render(dom);
            }
          }}></div>
      );
    }, [props.widget]);
    const canControlled =
      [EduRoleTypeEnum.teacher, EduRoleTypeEnum.assistant].includes(
        EduClassroomConfig.shared.sessionInfo.role,
      ) || grantUsers.has(EduClassroomConfig.shared.sessionInfo.userUuid);
    return (
      <WidgetTrack
        key={id}
        trackId={id}
        minHeight={widgetRoomProperties.size?.height}
        minWidth={widgetRoomProperties.size?.width}
        draggable={true}
        resizable={false}
        style={{
          zIndex:
            (widgetRoomProperties.extra as { [key: string]: unknown; zIndex?: number }).zIndex ?? 0,
        }}
        controlled={canControlled}
        cancel=".modal-title-close"
        boundaryName="extapp-track-bounds"
        handle="modal-title">
        <Modal
          onFullScreen={() => {
            if (track.isCovered) {
              widgetController.setTrack(
                id,
                true,
                { x: 0.5, y: 0.5, real: false },
                {
                  width: 0.54,
                  height: 0.71,
                  real: false,
                },
              );
            } else {
              setWidgetToFullScreen(id);
            }
          }}
          showFullscreen={canControlled}
          showRefresh
          onReload={() => {
            widgetController.sendMessageToWidget(id, AgoraWidgetCustomEventType.WidgetReload);
          }}
          className="widget-track-modal"
          title={title || ''}
          onCancel={() => {
            widgetController.deleteWidget(id);
          }}
          closable={canControlled}
          minHeight={widgetRoomProperties.size?.height}
          minWidth={widgetRoomProperties.size?.width}
          header={null}>
          {memo}
        </Modal>
      </WidgetTrack>
    );
  },
);
