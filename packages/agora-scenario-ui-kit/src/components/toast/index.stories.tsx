import React from 'react';
import { Meta } from '@storybook/react';
import { Toast } from '~components/toast';
import { Button } from '~components/button'

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
        Toast.show({
          type: toastType,
          text: toastType,
          duration: 5,
        })
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
