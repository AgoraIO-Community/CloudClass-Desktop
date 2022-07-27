import React from 'react';
import { Meta } from '@storybook/react';
import { Card } from '../card';

const meta: Meta = {
  title: 'Components/Card',
  component: Card,
};

type DocsProps = {
  width: number;
  height: number;
  borderRadius: number;
};

export const Docs = ({ width, height, borderRadius }: DocsProps) => (
  <>
    <div className="mt-4">
      <Card width={width} height={height}>
        <h1>Hello Card !</h1>
      </Card>
    </div>
    <div className="mt-4">
      <Card width={width} height={height} borderRadius={borderRadius}>
        <h1>自定义圆角</h1>
      </Card>
    </div>
  </>
);

Docs.args = {
  width: 250,
  height: 200,
  borderRadius: 12,
};

export default meta;
