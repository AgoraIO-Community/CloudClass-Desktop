import React, { FC } from 'react';
import './index.css';
import RcTabs, { TabsProps as RcTabsProps } from 'rc-tabs';
import { EditableConfig } from 'rc-tabs/lib/interface';
import classNames from 'classnames';
import { SvgIconEnum, SvgImg } from '../svg-img';

export type TabsType = 'line' | 'card' | 'editable-card';

export type { TabPaneProps } from 'rc-tabs';

export { TabPane } from 'rc-tabs';

export interface TabsProps extends Omit<RcTabsProps, 'editable'> {
  type?: TabsType;
  centered?: boolean;
  onEdit?: (e: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => void;
}

export const Tabs: FC<TabsProps> = ({ type, className, onEdit, centered, ...props }) => {
  const { prefixCls: customizePrefixCls, moreIcon = <SvgImg type={SvgIconEnum.MORE} /> } = props;
  const prefixCls = customizePrefixCls ?? 'tabs';

  let editable: EditableConfig | undefined;
  if (type === 'editable-card') {
    editable = {
      onEdit: (editType, { key, event }) => {
        //@ts-ignore
        onEdit?.(editType === 'add' ? event : key!, editType);
      },
      showAdd: false,
      removeIcon: <SvgImg type={SvgIconEnum.CLOSE} />,
    };
  }
  const rootPrefixCls = 'tabs';

  return (
    <RcTabs
      moreTransitionName={`${rootPrefixCls}-slide-up`}
      {...props}
      className={classNames(
        {
          [`${prefixCls}-card`]: ['fcr-card', 'editable-card'].includes(type as string),
          [`${prefixCls}-editable-card`]: type === 'editable-card',
          [`${prefixCls}-centered`]: centered,
        },
        className,
      )}
      moreIcon={moreIcon}
      editable={editable}
      prefixCls={prefixCls}
    />
  );
};
