import { EduRoomTypeEnum } from 'agora-edu-core';
import { FcrMultiThemes, FcrTheme, FcrUIConfig } from 'agora-common-libs';
import { room1V1Class, roomBigClass, roomMidClass } from '../configs/base-ui';
import { baseTheme } from '../configs/base-theme';
import { jumpToLine } from '.';

const fcrGlobalStyleSheetId = 'FcrStyleSheet';

export const themes: Record<string, FcrMultiThemes> = {
  default: baseTheme,
};

export const uiConfigs: Record<string, FcrUIConfig> = {
  [EduRoomTypeEnum.Room1v1Class]: room1V1Class,
  [EduRoomTypeEnum.RoomSmallClass]: roomMidClass,
  [EduRoomTypeEnum.RoomBigClass]: roomBigClass,
};

export const supportedRoomTypes: EduRoomTypeEnum[] = [];

export const loadTheme = (key: string, theme: FcrMultiThemes) => {
  const defaultLightTheme = baseTheme.light;
  const defaultDarkTheme = baseTheme.dark;

  const lightTheme = mergeTheme(defaultLightTheme, theme.light);
  const darkTheme = mergeTheme(defaultDarkTheme, theme.dark);

  themes[key] = {
    light: lightTheme,
    dark: darkTheme,
  };
};

const mergeTheme = (baseTheme: FcrTheme, theme: FcrTheme) => {
  return { ...baseTheme, ...theme };
};

export const loadUIConfig = (roomType: EduRoomTypeEnum, config: FcrUIConfig) => {
  if (!supportedRoomTypes.includes(roomType)) {
    supportedRoomTypes.push(roomType);
  }
  uiConfigs[roomType] = config;
};

export const applyTheme = (theme: FcrTheme) => {
  let cssString = '';

  for (const colorName in theme) {
    cssString += `--fcr_system_${jumpToLine(colorName)}_color: ${
      theme[colorName as keyof typeof theme]
    };`;
  }

  const fcrStyleSheet = document.querySelector(`#${fcrGlobalStyleSheetId}`);
  if (fcrStyleSheet) {
    fcrStyleSheet.textContent = `:root{
      ${cssString}
    }`;
  } else {
    const newStyleSheet = document.createElement('style');
    newStyleSheet.id = fcrGlobalStyleSheetId;
    newStyleSheet.textContent = `:root{
      ${cssString}
    }`;
    document.head.appendChild(newStyleSheet);
  }
};

export const loadGeneratedFiles = () => {
  const ctxRequire = require.context('../../generated', true, /.*\.ts$/);

  ctxRequire.keys().forEach((id) => {
    ctxRequire(id);
  });
};
