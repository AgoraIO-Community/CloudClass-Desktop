import React from 'react';
import { Meta } from '@storybook/react';
import './index.css';

const meta: Meta = {
  title: 'Components/SvgImg',
  component: null,
};

type DocsProps = {
  size: number;
};

export const Docs = ({ size, fill }: DocsProps) => <></>;

Docs.args = {
  size: 20,
};

export default meta;
