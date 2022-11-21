import React from 'react';
import { Meta } from '@storybook/react'
import { Button } from '../button';

const meta: Meta = {
  title: 'Components/Button',
  component: Button,
};

type DocsProps = {
  primary: string;
  secondary: string;
  ghost: string;
  danger: string;
};

export const Docs = ({ primary, secondary, ghost, danger }: DocsProps) => (
  <>
    <div>
      <Button style={{ width: 90 }}>{primary}</Button>
      <Button type="secondary">{secondary}</Button>
      <Button type="ghost">{ghost}</Button>
      <Button type="danger">{danger}</Button>
    </div>
    <div className="mt-4">
      <Button size="lg">{primary}</Button>
      <Button type="secondary" size="lg">
        {secondary}
      </Button>
      <Button type="ghost" size="lg">
        {ghost}
      </Button>
      <Button type="danger" size="lg">
        {danger}
      </Button>
    </div>
    <h5>Disabled</h5>
    <div className="my-4">
      <Button size="lg" disabled>
        {primary}
      </Button>
      <Button type="secondary" size="lg" disabled>
        {secondary}
      </Button>
      <Button type="ghost" size="lg" disabled>
        {ghost}
      </Button>
      <Button type="danger" size="lg" disabled>
        {danger}
      </Button>
    </div>
    <div className="my-4">
      <Button size="sm" disabled>
        {primary}
      </Button>
      <Button type="secondary" size="sm" disabled>
        {secondary}
      </Button>
      <Button type="ghost" size="sm" disabled>
        {ghost}
      </Button>
      <Button type="danger" size="sm" disabled>
        {danger}
      </Button>
    </div>
  </>
);

Docs.args = {
  primary: '确定',
  secondary: '取消',
  ghost: 'ghost',
  danger: 'danger',
};

export default meta;
