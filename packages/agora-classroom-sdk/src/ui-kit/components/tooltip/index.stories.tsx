import React, { FC } from 'react';
import { Meta } from '@storybook/react';
import { Button } from '~components/button';
import { Tooltip, TooltipProps } from '~components/tooltip';

const meta: Meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: {
    title: 'Hello Tooltip',
  },
  
};

export const Docs: FC<TooltipProps> = (props) => {
  return (
    <Tooltip {...props}>
      <Button>Tooltip</Button>
    </Tooltip>
  );
};

export default meta;
