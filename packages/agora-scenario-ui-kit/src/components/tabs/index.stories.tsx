import { Story } from '@storybook/react'
import React from 'react'
import { Icon } from '~components/icon'
import {Tab, TabPane} from '.'

export default {
  title: 'Components/Tabs',
  component: Tab,
}

type TabListProps = {
  tabBarGutter: number
}

export const TabList: Story<TabListProps> = ({
  tabBarGutter
}) => {

  const handleChange = (activeKey: string) => {
    console.log("activeKey", activeKey)
  }

  return (
    <Tab tabBarGutter={tabBarGutter} defaultActiveKey="2" onChange={handleChange}>
      <TabPane tab="公共资源" key="1">
        公共资源加载..
      </TabPane>
      <TabPane tab="我的资源" key="2">
        我的资源加载..
      </TabPane>
      <TabPane tab="下载课件" key="3">
        下载课件源加载..
      </TabPane>
    </Tab>
  )
}

TabList.args = {
  tabBarGutter: 44
}

export const CloseableTabList: Story<TabListProps> = ({
  tabBarGutter
}) => {

  const handleChange = (activeKey: string) => {
    console.log("activeKey", activeKey)
  }

  return (
    <Tab tabBarGutter={tabBarGutter} tabBarExtraContent="" size="sm" defaultActiveKey="2" onChange={handleChange}>
      <TabPane tab="公共资源" key="1" closable={true} closeIcon={<Icon type="close" />}>
        公共资源加载..
      </TabPane>
      <TabPane tab="我的资源" key="2" closable={true} closeIcon={<Icon type="close" />}>
        我的资源加载..
      </TabPane>
      <TabPane tab="下载课件" key="3" closable={true} closeIcon={<Icon type="close" />}>
        下载课件源加载..
      </TabPane>
    </Tab>
  )
}


CloseableTabList.args = {
  tabBarGutter: 44
}