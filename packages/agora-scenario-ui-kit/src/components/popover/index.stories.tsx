import React, { FC } from 'react';
import { Meta } from '@storybook/react';
import { Button } from '~components/button';
import { Popover, PopoverProps } from '~components/popover';
import { Calendar } from '~components/calendar';

const meta: Meta = {
  title: 'Components/Popover',
  component: Popover,
};

export const Docs: FC<PopoverProps> = (props) => {
  return (
    <>
      <div>
        <Popover trigger="click" placement="right" content="Hello Popover">
          <Button>Popover</Button>
        </Popover>
      </div>
      <div className="mt-10">
        <Popover
          trigger="click"
          overlayClassName="raw-popover"
          placement="right"
          content={<Calendar />}>
          <Button>calendar</Button>
        </Popover>
      </div>
    </>
  );
};

export default meta;