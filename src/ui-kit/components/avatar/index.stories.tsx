import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Avatar } from '.';

const meta: ComponentMeta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  args: {
    size: 175,
    textSize: 64,
    nickName: 'Jackie Chan',
  },
};

export const Docs: ComponentStory<typeof Avatar> = (props) => {
  return (
    <div>
      <div
        style={{
          width: 200,
          marginBottom: 50,
        }}>
        <Avatar {...props} />
      </div>
    </div>
  );
};

export default meta;
