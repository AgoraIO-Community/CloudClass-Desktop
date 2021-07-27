import React, { FC } from 'react';
import { Meta } from '@storybook/react';
import { Button } from '~components/button';
import { Tooltip, TooltipProps } from '~components/tooltip';
import { SvgImg } from '~components/svg-img';
import { Icon } from '~components/icon';

const meta: Meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: {
    title: 'Hello Tooltip',
  },
};

export const Docs: FC<TooltipProps> = (props) => {
  return (
    <>
      <Tooltip {...props}>
        <Button>Tooltip</Button>
      </Tooltip>

      <Tooltip {...props}>
        <span>
          <SvgImg type="close" canHover />
        </span>
      </Tooltip>

      <Tooltip {...props}>
        <div>test</div>
      </Tooltip>

      <Tooltip {...props}>
        <Icon type="close" />
      </Tooltip>
    </>
  );
};

export default meta;
