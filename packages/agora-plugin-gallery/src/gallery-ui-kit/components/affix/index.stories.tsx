import React, { FC, useState } from 'react';
import { Meta } from '@storybook/react';
import { Affix, AffixProps } from '~components/affix';
import { Icon } from '~components/icon';
import { Button } from '~components/button';

const meta: Meta = {
  title: 'Components/Affix',
  component: Affix,
};

export const Docs: FC<AffixProps> = (props) => {
  const [collapse, setCollapse] = useState(true);
  return (
    <div className="w-screen h-screen">
      <Affix
        {...props}
        top="20%"
        left="20%"
        collapse={collapse}
        onCollapse={() => setCollapse(false)}
        content={<Icon type="chat" />}
      >
        <>
          <div>content</div>
          <Button onClick={() => setCollapse(true)}>hide</Button>
        </>
      </Affix>
    </div>
  );
};

export default meta;
