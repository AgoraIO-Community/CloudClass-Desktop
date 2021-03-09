import React from 'react';
import { Meta } from '@storybook/react';
import { Button } from '~components/button';

const meta: Meta = {
  title: 'Components/Button',
  component: Button,
};

export const Docs = () => (
  <>
    <h5>Types</h5>
    <div className="my-4">
      <Button>Primary</Button>
      <Button type="danger">Danger</Button>
    </div>
    <h5>Size</h5>
    <div className="my-4">
      <Button size="lg">Primary</Button>
      <Button type="danger" size="lg">
        Danger
      </Button>
    </div>
    <h5>Disabled</h5>
    <div className="my-4">
      <Button size="lg" disabled>Primary</Button>
      <Button type="danger" size="lg" disabled>
        Danger
      </Button>
    </div>
  </>
);

export default meta;
