import React from 'react';
import { Meta } from '@storybook/react';
import { DatePicker } from '~components/date-picker';

const meta: Meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
};

type DocsProps = {
}

export const Docs = ({}: DocsProps) => (
  <>
    <div>
      <DatePicker/>
    </div>
  </>
);

Docs.args = {
}

export default meta;
