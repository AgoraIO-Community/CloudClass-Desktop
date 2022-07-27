import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import { Button } from '../';
import { useI18n, changeLanguage, transI18n } from '.';

const meta: Meta = {
  title: 'Components/I18n',
};

export type CloudStorageProps = {
  width: number;
  size: number;
};

const Text = ({ text }: any) => {
  const [lang, setLanguage] = useState<string>('zh');

  const t = useI18n();

  return (
    <div className="flex flex-1 items-center gap-10">
      <div className="w-20">{t(text)}</div>
      <Button
        onClick={() => {
          setLanguage(lang === 'zh' ? 'en' : 'zh');
          changeLanguage(lang === 'zh' ? 'en' : 'zh');
        }}>
        {t('zh')}
      </Button>
      <div>{transI18n('error.unknown', { errCode: '123', message: 'test' })}</div>
    </div>
  );
};

export const CloudStorage = ({ width, size }: CloudStorageProps) => {
  return <Text text="message"></Text>;
};

CloudStorage.args = {
  size: 1,
};

export default meta;
