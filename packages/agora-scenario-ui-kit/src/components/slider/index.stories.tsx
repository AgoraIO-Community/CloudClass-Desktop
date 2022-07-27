import React from 'react';
import { Meta } from '@storybook/react';
import { Slider } from '../slider';

const meta: Meta = {
  title: 'Components/Slider',
  component: Slider,
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
      <Slider
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
