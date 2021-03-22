import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import { Button } from '~components';
import { I18nProvider, useTranslation } from '~components/i18n'

const meta: Meta = {
  title: 'Components/I18n',
};

export type CloudStorageProps = {
  width: number,
  size: number
}

const Text = ({text}: any) => {

  const {i18n, t} = useTranslation()

  //@ts-ignore
  window.i18n = i18n

  //@ts-ignore
  window.t = t

  const [lang, setLanguage] = useState<string>('zh')
  
  return (
    <div className="flex flex-1 items-center gap-10">
      <div className="w-20">{t(text)}</div>
      <Button onClick={() => {
        setLanguage(lang === 'zh' ? 'en' : 'zh')
        i18n.changeLanguage(lang === 'zh' ? 'en' : 'zh')
      }}>{t('zh')}</Button>
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