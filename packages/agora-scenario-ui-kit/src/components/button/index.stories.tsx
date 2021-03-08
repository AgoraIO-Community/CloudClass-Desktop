import React from 'react';
import { Meta } from '@storybook/react';
import { Button } from '~components/button';

const meta: Meta = {
  title: 'Components/Button',
  component: Button,
};

export const Docs = () => (
  <>
    <Button id="primary" type="primary">Primary</Button>
    <Button id="Ghost" type="danger">Ghost</Button>
    <Button id="primary" type="primary" disabled>
      Primary
    </Button>
    <Button id="danger" type="danger" disabled>
      Ghost
    </Button>
  </>
);

export default meta;
