import { AgoraEduSDK } from '@/infra/api';
import { EduRoomTypeEnum } from 'agora-edu-core';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from '~ui-kit';
import { HomeApi } from '../api/home';

export const useBuilderConfig = () => {
  const t = useI18n();
  const [configReady, setConfigReady] = useState(false);
  const builderResource = useRef({
    scenes: {},
    themes: {},
  });

  const defaultScenes = [
    { text: t('home.roomType_1v1'), value: `${EduRoomTypeEnum.Room1v1Class}` },
    { text: t('home.roomType_interactiveSmallClass'), value: `${EduRoomTypeEnum.RoomSmallClass}` },
    { text: t('home.roomType_interactiveBigClass'), value: `${EduRoomTypeEnum.RoomBigClass}` },
  ];

  const [roomTypes, setRoomTypes] = useState<EduRoomTypeEnum[]>([]);

  const sceneOptions = defaultScenes.filter(({ value }) => {
    return roomTypes.some((t) => `${t}` === value);
  });

  useEffect(() => {
    const companyId = window.__launchCompanyId;
    const projectId = window.__launchProjectId;

    if (companyId && projectId) {
      HomeApi.shared.getBuilderResource(companyId, projectId).then(({ scenes, themes }) => {
        builderResource.current = {
          scenes: scenes ?? {},
          themes: themes ? { default: themes } : {},
        };

        AgoraEduSDK.setParameters(
          JSON.stringify({
            uiConfigs: builderResource.current.scenes,
            themes: builderResource.current.themes,
          }),
        );

        setRoomTypes(AgoraEduSDK.getLoadedScenes().map(({ roomType }) => roomType));
        setConfigReady(true);
      });
    } else {
      setConfigReady(true);
      setRoomTypes(AgoraEduSDK.getLoadedScenes().map(({ roomType }) => roomType));
    }
  }, []);

  return {
    builderResource,
    sceneOptions: sceneOptions.length ? sceneOptions : defaultScenes,
    configReady,
  };
};
