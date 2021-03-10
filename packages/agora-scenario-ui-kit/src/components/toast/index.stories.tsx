import React from 'react';
import { Meta } from '@storybook/react';
import { Toast } from '~components/toast';

const meta: Meta = {
  title: 'Components/Toast',
  component: Toast,
};

type DocsProps = {
  success: string,
  error: string,
  warning: string
}

export const Docs = ({success, error, warning}: DocsProps) => (
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
  </>
);

Docs.args = {
  success: 'success',
  error: 'error',
  warning: 'warning'
}

export default meta;
