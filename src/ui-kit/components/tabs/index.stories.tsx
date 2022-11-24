import React from 'react';
import { Meta } from '@storybook/react';
import { ATabs, ATabPane } from '../tabs';
import { SvgIconEnum, SvgImg } from '../svg-img';

const meta: Meta = {
  title: 'Components/Tabs',
  component: ATabs,
  subcomponents: {
    TabPane: ATabPane,
  },
};

export const Docs = () => {
  return (
    <>
      <ATabs animated>
        <ATabPane tab="公共资源" key="0">
          <div>公共资源</div>
          <div>公共资源</div>
          <div>公共资源</div>
        </ATabPane>
        <ATabPane tab="我的云盘" key="1">
          <div>我的云盘</div>
          <div>我的云盘</div>
          <div>我的云盘</div>
        </ATabPane>
        <ATabPane tab="下载课件" key="2">
          <div>下载课件</div>
          <div>下载课件</div>
          <div>下载课件</div>
        </ATabPane>
      </ATabs>
      <br />
      <br />
      <ATabs type="editable-card">
        <ATabPane
          tab={
            <>
              <SvgImg type={SvgIconEnum.WHITEBOARD} />
              白板
            </>
          }
          closable={false}
          key="0">
          <div>公共资源</div>
          <div>公共资源</div>
          <div>公共资源</div>
        </ATabPane>
        <ATabPane
          tab={
            <>
              <SvgImg type={SvgIconEnum.SHARE_SCREEN} />
              Storybook的屏幕共享
            </>
          }
          key="1">
          <div>PPT课件制作规范</div>
          <div>PPT课件制作规范</div>
          <div>PPT课件制作规范</div>
        </ATabPane>
        <ATabPane tab="如何制作课件" key="2">
          <div>如何制作课件</div>
          <div>如何制作课件</div>
          <div>如何制作课件</div>
        </ATabPane>
        <ATabPane tab="如何制作课件 3" key="3">
          <div>如何制作课件</div>
          <div>如何制作课件</div>
          <div>如何制作课件</div>
        </ATabPane>
        <ATabPane tab="如何制作课件 4" key="4">
          <div>如何制作课件</div>
          <div>如何制作课件</div>
          <div>如何制作课件</div>
        </ATabPane>
        <ATabPane tab="如何制作课件 5" key="5">
          <div>如何制作课件</div>
          <div>如何制作课件</div>
          <div>如何制作课件</div>
        </ATabPane>
        <ATabPane tab="如何制作课件 6" key="6">
          <div>如何制作课件</div>
          <div>如何制作课件</div>
          <div>如何制作课件</div>
        </ATabPane>
        <ATabPane tab="如何制作课件 7" key="7">
          <div>如何制作课件</div>
          <div>如何制作课件</div>
          <div>如何制作课件</div>
        </ATabPane>
        <ATabPane tab="如何制作课件 8" key="8">
          <div>如何制作课件</div>
          <div>如何制作课件</div>
          <div>如何制作课件</div>
        </ATabPane>
      </ATabs>
    </>
  );
};

export default meta;
