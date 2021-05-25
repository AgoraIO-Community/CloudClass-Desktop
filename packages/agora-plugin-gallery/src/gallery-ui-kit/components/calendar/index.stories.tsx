import React from 'react';
import { Meta } from '@storybook/react';
import { Calendar } from '~components/calendar';

const meta: Meta = {
  title: 'Components/Calendar',
  component: Calendar,
};

type DocsProps = {
}

export const Docs = ({}: DocsProps) => (
  <>
    <div>
      <Calendar></Calendar>
    </div>
  </>
);

Docs.args = {
}

export default meta;
