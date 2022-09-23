import { LanguageEnum } from '@/infra/api';
import React, { useMemo } from 'react';
import { getI18n } from 'react-i18next';

type ComWithI18nMaps = Partial<
  {
    [key in LanguageEnum]: React.ReactNode;
  }
>;

/**
 * 根据语言渲染不同的元素
 *
 * @param maps ComWithI18nMaps
 * @returns React.ReactNode
 */
export const useElementWithI18n = (maps: ComWithI18nMaps) => {
  const i18n = getI18n();
  const com = useMemo(() => {
    if (maps[i18n.language]) {
      return maps[i18n.language];
    }
    return '';
  }, [i18n.language, maps.en, maps.zh]);
  return com;
};
