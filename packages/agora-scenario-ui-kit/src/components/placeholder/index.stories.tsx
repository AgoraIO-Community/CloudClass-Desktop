import React from 'react';
import { Meta } from '@storybook/react';
import { Placeholder, CameraPlaceHolder, BoardPlaceHolder } from '~components/placeholder';

const meta: Meta = {
  title: 'Components/Placeholder',
  component: Placeholder,
};

type DocsProps = {
  placeholderDesc: string;
};

export const Docs = ({ placeholderDesc }: DocsProps) => (
  <>
    <div className="mt-4">
      <Placeholder />
    </div>
    <div className="mt-4">
      <Placeholder placeholderType="noFile" />
    </div>
    <div className="mt-4">
      <Placeholder placeholderType="noQuestion" />
    </div>
    <div className="mt-4">
      <CameraPlaceHolder state="loading" />
    </div>
    <div className="mt-4">
      <CameraPlaceHolder state="broken" />
    </div>
    <div className="mt-4">
      <CameraPlaceHolder state="muted" />
    </div>
    <div className="mt-4">
      <CameraPlaceHolder state="disabled" />
    </div>
    <div
      className="mt-4"
      style={{
        height: 500,
      }}>
      <BoardPlaceHolder
        onReconnectClick={() => {
          console.log('重新连接');
        }}
      />
    </div>
  </>
);

Docs.args = {
  placeholderDesc: '',
};

export default meta;
