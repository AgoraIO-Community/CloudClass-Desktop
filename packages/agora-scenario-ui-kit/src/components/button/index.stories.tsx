import React from 'react';
import { Meta } from '@storybook/react';
import { Button } from '~components/button';

const meta: Meta = {
  title: 'Components/Button',
  component: Button,
};

export const Docs = () => (
  <>
    <div>
      <Button>Primary</Button>
      <Button type="danger">Danger</Button>
    </div>
    <div className="mt-4">
      <Button size="lg">Primary</Button>
      <Button type="danger" size="lg">
        Danger
      </Button>
    </div>
  </>
);

export default meta;
