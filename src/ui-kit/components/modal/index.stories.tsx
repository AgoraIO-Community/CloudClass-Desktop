import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import { Button } from '../button';
import { Modal } from '../modal';

const meta: Meta = {
  title: 'Components/Modal',
  component: Modal,
};

type DocsProps = {
  title: string;
};


export const Docs = ({ title }: DocsProps) => (
  <>
    <div className="fcr-mt-4">
      <Modal title={title} footer={[<Button type="secondary">test</Button>, <Button>test</Button>]}>
        <p>你确定要下课吗？</p>
      </Modal>
    </div>
    <div className="fcr-mt-4">
      <Modal title={title} closable={false} footer={[<Button>test</Button>]}>
        <p>试用时间到，教室已解散！</p>
      </Modal>
    </div>
    <div className="fcr-mt-4">
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


export default meta;
