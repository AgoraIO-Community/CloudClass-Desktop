import { EduRoomTypeEnum } from 'agora-edu-core';
import { FcrTheme } from '~ui-kit';
import { humpToLine } from '.';
import { FcrMultiThemes, FcrScenarioUI, FcrUIConfig } from '../types/config';

const fcrGlobalStyleSheetId = 'FcrStyleSheet';

export const themes: Record<string, FcrMultiThemes> = {};

export const uiConfigs: Record<string, FcrUIConfig> = {};

export const loadTheme = (key: string, theme: FcrMultiThemes) => {
  themes[key] = theme;
};

export const loadUIConfig = (roomType: EduRoomTypeEnum, config: FcrUIConfig) => {
  uiConfigs[roomType] = config;
};

export const loadScenarioUI = (ui: FcrScenarioUI) => {};

export const applyTheme = (theme: FcrTheme) => {
  let cssString = '';

  for (const colorName in theme) {
    cssString += `--fcr_system_${humpToLine(colorName)}_color: ${theme[colorName]};`;
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
  const ctxRequire = require.context('@/generated', true, /.*\.ts$/);

  ctxRequire.keys().forEach((id) => {
    ctxRequire(id);
  });
};
