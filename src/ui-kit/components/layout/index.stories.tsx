import React from 'react';
import { Meta } from '@storybook/react';
import { Aside, Content, Header, Layout } from '.';

const meta: Meta = {
  title: 'Components/Layout',
  component: Layout,
  subcomponents: {
    Header: Header,
    Aside: Aside,
    Content: Content,
  },
};

export const Docs = () => (
  <Layout direction="col" className="fcr-bg-green-300" style={{ width: '100vw', height: '100vh' }}>
    <Header className="fcr-bg-green-400"></Header>
    <Layout className="fcr-bg-green-500" style={{ height: '100%' }}>
      <Content className="fcr-bg-green-600"></Content>
      <Aside className="fcr-bg-green-700"></Aside>
    </Layout>
  </Layout>
);

export default meta;
