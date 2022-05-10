import { Meta } from '@storybook/react';
import { RemoteControlActionBar } from '.';

export const Docs = () => {
  return (
    <RemoteControlActionBar
      defaultValue={'1'}
      studentList={[
        { userUuid: '1', userName: 1, userRole: 1 },
        { userUuid: '2', userName: 2, userRole: 2 },
      ]}></RemoteControlActionBar>
  );
};
const meta: Meta = {
  title: 'Biz/RemoteControlActionBar',
  component: RemoteControlActionBar,
};
export default meta;
