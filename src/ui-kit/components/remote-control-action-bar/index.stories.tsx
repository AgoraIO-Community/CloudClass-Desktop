import React from 'react';
import { Meta } from '@storybook/react';
import { RemoteControlActionBar } from '.';

export const Docs = () => {
  return (
    <RemoteControlActionBar
      studentList={[
        { userUuid: '1', userName: '1', userRole: 1, userProperties: {} },
        { userUuid: '2', userName: '2', userRole: 2, userProperties: {} },
      ]}
      value={''}
      onChange={function (studentUuid: string) {
      }}
      onClose={function () {
      }}></RemoteControlActionBar>
  );
};
const meta: Meta = {
  title: 'Biz/RemoteControlActionBar',
  component: RemoteControlActionBar,
};
export default meta;
