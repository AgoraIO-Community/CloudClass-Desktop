import { LanguageEnum } from '@/infra/api';
import { useContext, useMemo } from 'react';
import { GlobalStoreContext } from '../stores';

type LangSwitchValueMaps<T = unknown> = Partial<
  {
    [key in LanguageEnum]: T;
  }
>;

/**
 * 根据语言渲染不同的元素
 *
 * @param maps ComWithI18nMaps
 * @returns React.ReactNode
 */
export function useLangSwitchValue<T = unknown>(maps: LangSwitchValueMaps<T>): T | null {
  const { language } = useContext(GlobalStoreContext);
  const ele = useMemo(() => {
    return maps[language];
  }, [language, maps.en, maps.zh]);

  return ele || null;
}
