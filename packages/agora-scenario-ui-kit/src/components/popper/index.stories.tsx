import React, { EventHandler, FC, SyntheticEvent, useState } from 'react';
import { Meta } from '@storybook/react';
import { Button } from '~components/button';
import { Popper, PopperProps } from '~components/popper';

const meta: Meta = {
  title: 'Components/Popper',
  component: Popper,
};

export const Docs: FC<PopperProps> = (props) => {
  const [visible, setVisible] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const handleClick: EventHandler<SyntheticEvent<HTMLButtonElement>> = (
    event,
  ) => {
    setVisible(true);
    setAnchorEl(event.currentTarget);
  };
  return (
    <div className="bg-black w-screen h-screen">
      <Button className="m-96" onClick={handleClick}>Popover</Button>
      <Popper {...props} visible={visible} anchorEl={anchorEl}>
        <div>
          <div>content</div>
          <Button onClick={() => setVisible(false)}>hide</Button>
        </div>
      </Popper>
    </div>
  );
};

export default meta;
