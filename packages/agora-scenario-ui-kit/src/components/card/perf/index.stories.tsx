import React from 'react';
import { Meta } from '@storybook/react';
import { MemoryPerf, MemoryPerfProps } from '.';

const meta: Meta = {
  title: 'Components/Perf',
  component: MemoryPerf,
};

export const Docs = (props: MemoryPerfProps) => (
  <>
    <div>
      <div style={{ width: 150 }}>
        <MemoryPerf {...props} />
      </div>
    </div>
  </>
);

Docs.args = {
  placeholderDesc: '',
  title: 'title',
  rss: 100,
  heapTotal: 100,
  heapUsed: 100,
  external: 100,
};

export default meta;
