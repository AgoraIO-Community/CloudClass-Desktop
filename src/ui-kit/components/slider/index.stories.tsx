import { Meta } from '@storybook/react';
import React from 'react';
import { ASlider } from '../slider';

const meta: Meta = {
  title: 'Components/Slider',
  component: ASlider,
};

type DocsType = {
  defaultValue: 0;
  disabled: boolean;
  max: number;
  min: number;
  step: number;
  onChange: (value: number) => void;
};

export const Docs = ({ defaultValue, disabled, max, min, step, onChange }: DocsType) => (
  <>
    <div>
      <ASlider
        key={defaultValue}
        defaultValue={defaultValue}
        disabled={disabled}
        max={max}
        min={min}
        step={step}
        onChange={onChange}
      />
    </div>
  </>
);

Docs.args = {
  defaultValue: 50,
  disabled: false,
  max: 100,
  min: 0,
  step: 1,
  onChange: (value: number) => {
    console.log(value);
  },
};

export default meta;
