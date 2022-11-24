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
  <Layout direction="col" className="bg-green-300" style={{ width: '100vw', height: '100vh' }}>
    <Header className="bg-green-400"></Header>
    <Layout className="bg-green-500" style={{ height: '100%' }}>
      <Content className="bg-green-600"></Content>
      <Aside className="bg-green-700"></Aside>
    </Layout>
  </Layout>
);

export default meta;
