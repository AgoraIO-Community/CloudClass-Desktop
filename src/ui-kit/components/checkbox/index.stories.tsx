import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import { CheckBox } from './';

const meta: Meta = {
  title: 'Components/CheckBox',
  component: CheckBox,
};

export const Docs = () => {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <div className="mt-2 ml-2">
        <CheckBox
          text={'非禁用'}
          checked={checked}
          onChange={() => {
            setChecked(!checked);
          }}
        />
      </div>
      <div className="mt-2 ml-2">
        <CheckBox
          text={'半选'}
          indeterminate
          // disabled
        />
      </div>
      <div className="mt-2 ml-2">
        <CheckBox
          disabled
          text={'禁用'}
          onChange={() => {
            setChecked(!checked);
          }}
        />
      </div>
    </>
  );
};

export default meta;
