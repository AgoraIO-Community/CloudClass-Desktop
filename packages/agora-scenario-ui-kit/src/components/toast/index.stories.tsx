import React from 'react';
import { Meta } from '@storybook/react';
import { Toast } from '~components/toast';
import { Button } from '~components/button'

import Notification from 'rc-notification'

const meta: Meta = {
  title: 'Components/Toast',
  component: Toast,
  argTypes: {
    toastType: {
      control: {
        type: 'select',
        options: ['success', 'error', 'warning']
      }
    }
  }
};

type DocsProps = {
  success: string,
  error: string,
  warning: string,
  toastText: string,
  toastType: any,
}

export const Docs = ({success, error, warning, toastText, toastType = 'success'}: DocsProps) => (
  <>
    <div>
      <Toast>{success}</Toast>
    </div>
    <div className="mt-4">
      <Toast type="error">{error}</Toast>
    </div>
    <div className="mt-4">
      <Toast type="warning">{warning}</Toast>
    </div>
    <div className="mt-4">
      <Button size="lg" onClick={() => {
        Notification.newInstance({}, notification => {
          notification.notice({
            content: <Toast type={toastType}>{toastText}</Toast>,
            style: {
              position: 'fixed',
              top: '5%',
              left: '50%',
              transform: 'translateX(-50%)'
            }
          });
        });
      }}>show toast</Button>
    </div>
  </>
);

Docs.args = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  toastText: 'test',

}

export default meta;
