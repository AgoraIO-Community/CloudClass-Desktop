import React from 'react';
import { Meta } from '@storybook/react';
import { Button } from '~components/button';

const meta: Meta = {
  title: 'Components/Button',
  component: Button,
};

export const Docs = (props: {primaryText: string, dangerText: string}) => (
  <div className="grid grid-flow-col md:grid-flow-col">
    <Button id="primary" type="primary">{props.primaryText}</Button>
    <Button id="Ghost" type="danger">{props.dangerText}</Button>
    <Button id="primary" type="primary" disabled>
      {props.primaryText}
    </Button>
    <Button id="danger" type="danger" disabled>
      {props.dangerText}
    </Button>
    <Button id="primary" type="primary" large>{props.primaryText}</Button>
    <Button id="Ghost" type="danger" large>{props.dangerText}</Button>
    <Button id="primary" type="primary" disabled large>
      {props.primaryText}
    </Button>
    <Button id="danger" type="danger" disabled large>
      {props.dangerText}
    </Button>
  </div>
);

Docs.args = {
  primaryText: 'Primary',
  dangerText: 'Danger',
}

export default meta;
