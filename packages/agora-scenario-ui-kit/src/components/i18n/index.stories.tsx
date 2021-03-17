import { Meta } from '@storybook/react';
import React from 'react';
import { Button } from '~components';
import { makeI18nProvider } from '.';

const meta: Meta = {
  title: 'Components/I18n',
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
  size: 1
}

export default meta;
