import React from 'react'
import { BaseProps } from '~components/interface/base-props'
import RcTabs, {TabsProps as RcTabProps} from 'rc-tabs'
import classnames from 'classnames'
import './style.css'

type TabBaseProps = Pick<RcTabProps, 
  | 'prefixCls'
  | 'className'
  | 'style'
  | 'children'
  | 'id'
  | 'activeKey'
  | 'defaultActiveKey'
  | 'onChange'
  | 'onTabClick'
  | 'onTabScroll'
  | 'tabBarStyle'
  | 'tabBarGutter'
  | 'direction'
  | 'tabBarExtraContent'
  > & BaseProps


export interface TabProps extends TabBaseProps {
  onChange: (activeKey: string) => void,
  className?: string,
}

export const Tab: React.FC<TabProps> = ({
  prefixCls,
  size,
  direction = 'ltr',
  className,
  ...restProps
}) => {
  const cls = classnames({
    [`rc-tabs-${size}`]: size,
    [`${className}`]: !!className,
  })

  return (
    <RcTabs
      direction={direction}
      moreTransitionName={`${prefixCls}-slide-up`}
      prefixCls="rc-tabs"
      className={cls}
      {...restProps}
    ></RcTabs>
  )
}

export const IconTab: React.FC<TabProps> = () => {
  return (
    <RcTabs></RcTabs>
  )
}

export { TabPane } from 'rc-tabs';
export type { TabPaneProps } from 'rc-tabs';