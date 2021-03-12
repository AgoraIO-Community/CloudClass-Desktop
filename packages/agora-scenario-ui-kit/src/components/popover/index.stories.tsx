import React, { FC } from 'react';
import { Meta } from '@storybook/react';
import { Button } from '~components/button';
import { Popover, PopoverProps } from '~components/popover';

const meta: Meta = {
  title: 'Components/Popover',
  component: Popover,
  args: {
    content: 'Hello Popover',
  },
};

export const Docs: FC<PopoverProps> = (props) => {
  return (
    <Popover {...props} trigger="click">
      <Button>Popover</Button>
    </Popover>
  );
};

export default meta;
