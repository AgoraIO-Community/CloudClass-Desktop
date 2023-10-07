import Tabs, { TabPaneProps, TabsProps } from 'antd/lib/tabs';
import classNames from 'classnames';
import React, { FC, PropsWithChildren } from 'react';
import { SvgIconEnum, SvgImg } from '../svg-img';
import './index.css';

export type ATabsProps = Pick<
  TabsProps,
  | 'className'
  | 'activeKey'
  | 'centered'
  | 'type'
  | 'onChange'
  | 'onEdit'
  | 'onTabClick'
  | 'animated'
  | 'moreIcon'
  | 'renderTabBar'
  | 'items'
>;

export const ATabs: FC<PropsWithChildren<ATabsProps>> = ({
  type,
  className,
  onEdit,
  centered,
  ...props
}) => {
  const { moreIcon = <SvgImg type={SvgIconEnum.MORE} /> } = props;

  return (
    <Tabs {...props} className={classNames({ 'fcr-theme': 1 }, className)} moreIcon={moreIcon} />
  );
};

export type ATabPaneProps = Pick<TabPaneProps, 'className' | 'tab' | 'tabKey'>;

export const ATabPane: FC<PropsWithChildren<ATabPaneProps>> = ({ className, ...props }) => {
  return <Tabs.TabPane {...props} className={classNames({ 'fcr-theme': 1 }, className)} />;
};
