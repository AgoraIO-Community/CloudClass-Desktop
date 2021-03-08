import React from 'react';
import { Meta } from '@storybook/react';
import Button from '.';

const meta: Meta = {
  title: 'Components/Button',
  component: Button,
};

export const Types = () => (
  <>
    <Button type="primary">Primary</Button>
    <Button type="danger">Ghost</Button>
  </>
);

export const Disabled = () => (
  <>
    <Button type="primary" disabled>
      Primary
    </Button>
    <Button type="danger" disabled>
      Ghost
    </Button>
  </>
);

export default meta;
