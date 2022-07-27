import React from 'react';
import { Meta } from '@storybook/react';
import { Card } from '../card';
import { Loading } from '../loading';
import { Button } from '../button';

const meta: Meta = {
  title: 'Components/Loading',
  component: Loading,
};

type DocsProps = {};

export const Docs = () => (
  <>
    <div className="mt-4">
      <Card width={90} height={90}>
        <Loading></Loading>
      </Card>
    </div>
    <div className="mt-4">
      <Card width={110} height={114}>
        <Loading loadingText="加载中..."></Loading>
      </Card>
    </div>
    <div className="mt-4">
      <Card width={258} height={113}>
        <Loading hasLoadingGif={false} loadingText="课件加载中，请稍候…" hasProgress></Loading>
      </Card>
    </div>
    <div className="mt-4">
      <Card width={258} height={162}>
        <Loading
          hasLoadingGif={false}
          loadingText="课件加载中，请稍候…"
          hasProgress
          currentProgress={70}
          footer={[<Button type="secondary">跳过</Button>]}></Loading>
      </Card>
    </div>
    <div className="mt-4">
      <Card width={300} height={300}>
        <Loading
          hasLoadingGif
          loadingText="课件加载中，请稍候…"
          hasProgress
          currentProgress={99}
          footer={[<Button type="secondary">跳过</Button>, <Button>确定</Button>]}></Loading>
      </Card>
    </div>
  </>
);

Docs.args = {};

export default meta;
