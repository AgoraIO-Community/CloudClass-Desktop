import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import { Toast } from '../toast';
import { Button } from '../button';

const meta: Meta = {
  title: 'Components/Toast',
  component: Toast,
  argTypes: {
    toastType: {
      control: {
        type: 'select',
        options: ['success', 'error', 'warning'],
      },
    },
  },
};

type DocsProps = {
  success: string;
  error: string;
  warning: string;
  toastText: string;
  toastType: any;
};

export const Docs = ({ success, error, warning, toastText, toastType = 'success' }: DocsProps) => {
  const [visible, setVisible] = useState(true);
  return (
    <>
      <div>
        <Toast>{success}</Toast>
      </div>
      <div className="mt-4">
        <Toast type="error">{error}</Toast>
      </div>
      <div className="mt-4">
        {visible ? (
          <Toast
            type="warning"
            closeToast={() => {
              setVisible(false);
            }}
            canStop={true}>
            {warning}
          </Toast>
        ) : (
          ''
        )}
      </div>
      <div className="mt-4">
        <Button
          size="lg"
          onClick={() => {
            Toast.show({
              type: toastType,
              text: toastType,
              duration: 1,
            });
          }}>
          show toast - default right top corner
        </Button>
      </div>
      <div className="mt-4">
        <Button
          size="lg"
          onClick={() => {
            Toast.show({
              type: toastType,
              text: '自己定义的内容，时间设置5s，居中',
              duration: 5,
            });
          }}>
          show toast - user define
        </Button>
      </div>
    </>
  );
};

Docs.args = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  toastText: 'test',
};

export default meta;
