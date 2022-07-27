import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import { Button } from '../button';
import { transI18n } from '../i18n';
import { Modal } from '../modal';

const meta: Meta = {
  title: 'Components/Modal',
  component: Modal,
};

type DocsProps = {
  title: string;
};

function asyncOkFunction(e: any): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 3000);
  });
}

export const Docs = ({ title }: DocsProps) => (
  <>
    <div className="mt-4">
      <Modal title={title} footer={[<Button type="secondary">test</Button>, <Button>test</Button>]}>
        <p>你确定要下课吗？</p>
      </Modal>
    </div>
    <div className="mt-4">
      <Modal title={title} closable={false} footer={[<Button>test</Button>]}>
        <p>试用时间到，教室已解散！</p>
      </Modal>
    </div>
    <div className="mt-4">
      <Modal
        title={title}
        style={{ width: 320 }}
        footer={[<Button type="ghost">test</Button>, <Button>test</Button>]}>
        <p>课件未能加载成功，您可以点击重新加载重试，或者从云盘中播放课件</p>
      </Modal>
    </div>
  </>
);

Docs.args = {
  title: 'Modal Title',
};

export const KickStudents = () => {
  const [value, setValue] = useState<string>('');

  return (
    <Modal
      style={{ width: 300 }}
      title={'移出学生'}
      onOk={() => {
        console.log(value);
      }}
      footer={[
        <Button type="secondary" action="cancel">
          取消
        </Button>,
        <Button action="ok">确定</Button>,
      ]}>
      <div className="radio-container">
        <label className="customize-radio">
          <input
            type="radio"
            name="kickType"
            value="kicked_once"
            onClick={() => setValue('kicked_once')}
          />
          <span className="ml-2">{transI18n('radio.kicked_once')}</span>
        </label>
        <label className="customize-radio">
          <input
            type="radio"
            name="kickType"
            value="kicked_ban"
            onClick={() => setValue('kicked_ban')}
          />
          <span className="ml-2">{transI18n('radio.ban')}</span>
        </label>
      </div>
    </Modal>
  );
};

export default meta;
