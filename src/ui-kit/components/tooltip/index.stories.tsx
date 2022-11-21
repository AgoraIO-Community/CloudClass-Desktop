import React, { FC } from 'react';
import { Meta } from '@storybook/react';
import { Button } from '../button';
import { Tooltip, TooltipProps } from './';
import { SvgIcon, SvgIconEnum, SvgImg } from '../svg-img';

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
          <SvgImg type={SvgIconEnum.CLOSE} />
        </span>
      </Tooltip>

      <Tooltip {...props}>
        <div>test</div>
      </Tooltip>

      <Tooltip {...props}>
        <SvgImg type={SvgIconEnum.CLOSE} />
      </Tooltip>
    </>
  );
};

export default meta;
