import React, { useCallback, useEffect, useMemo } from 'react';
import { Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { IconBox } from '~components/icon';
import { Button } from '~components';
import ReactDOM from 'react-dom';
import { formatFileSize } from '~utilities';
import { makeI18nProvider } from '.';

const meta: Meta = {
  title: 'Components/I18n',
  // component: 
};

const {I18nProvider, useI18nContext} = makeI18nProvider("zh")

export type CloudStorageProps = {
  width: number,
  size: number
}

const Text = ({text}: any) => {

  const i18n = useI18nContext()
  
  return (
    <div className="flex flex-1 items-center gap-10">
      <div className="w-20">{i18n.t(text)}</div>
      <Button onClick={() => {
        i18n.changeLanguage(i18n.lang === 'zh' ? 'en' : 'zh')
      }}>{i18n.t(i18n.lang)}</Button>
    </div>
  )
}

export const CloudStorage = ({width, size}: CloudStorageProps) => {
  return(
    <I18nProvider>
      <Text text="message"></Text>
    </I18nProvider>
  )
}

CloudStorage.args = {
  width: 560,
  size: 1
}

export default meta;
