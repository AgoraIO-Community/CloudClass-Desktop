import {
  IAgoraExtApp,
  useAppPluginContext,
  useBoardContext,
  useRoomContext,
  useScreenShareContext,
} from 'agora-edu-core';
import { EduRoleTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useCallback } from 'react';
import { SvgImg, t, ToolCabinet } from '~ui-kit';
import { CabinetItem } from '~ui-kit/components/toolbar/tool-cabinet';

export const ToolCabinetContainer = observer(() => {
  const { setLaserPoint, currentSelector } = useBoardContext();

  const { canSharingScreen, startOrStopSharing } = useScreenShareContext();

  const { appPlugins, onLaunchAppPlugin } = useAppPluginContext();

  const onClick = useCallback(
    async (itemType: string) => {
      switch (itemType) {
        case 'screenShare': {
          if (canSharingScreen) {
            await startOrStopSharing();
          }
          break;
        }
        case 'laser': {
          setLaserPoint();
          break;
        }
        case 'countdown':
          onLaunchAppPlugin('io.agora.countdown');
          break;
        default: {
          onLaunchAppPlugin(itemType);
          break;
        }
      }
    },
    [canSharingScreen, startOrStopSharing, setLaserPoint, onLaunchAppPlugin],
  );

  const { roomInfo } = useRoomContext();

  const getCabinetList = useCallback(() => {
    const screenShareTool: CabinetItem[] = [
      {
        id: 'screenShare',
        icon: <SvgImg type="share-screen" size={24} />,
        name: t('scaffold.screen_share'),
      },
    ];

    const restTools: CabinetItem[] = [
      {
        id: 'laser',
        icon: <SvgImg type="laser-pointer" />,
        name: t('scaffold.laser_pointer'),
      },
      ...appPlugins.map((p: IAgoraExtApp) => {
        return {
          id: p.appIdentifier,
          icon: <SvgImg type="countdown" size={24} />,
          name: p.appName,
        };
      }),
    ];

    if (roomInfo.userRole === EduRoleTypeEnum.teacher) {
      return screenShareTool.concat(...restTools);
    } else {
      return restTools;
    }
  }, [roomInfo.userRole]);

  return (
    <ToolCabinet
      key={`${canSharingScreen}`}
      value="tools"
      label={t('scaffold.tools')}
      icon="tools"
      cabinetList={getCabinetList()}
      onClick={onClick}
      activeItem={currentSelector}
    />
  );
});
