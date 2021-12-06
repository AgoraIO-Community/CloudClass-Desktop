import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import { Pagination } from './index';

const meta: Meta = {
  title: 'Components/Pagination',
  component: Pagination,
};

type DocsProps = {
  total: number;
};

export const Docs = (props: DocsProps) => <Pagination {...props}></Pagination>;

Docs.args = {
  total: 1000,
};

export default meta;
