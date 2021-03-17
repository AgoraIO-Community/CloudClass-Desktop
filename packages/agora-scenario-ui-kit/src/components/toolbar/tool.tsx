import React, { FC, ReactNode, useState } from 'react';
import { Icon, IconTypes } from '~components/icon';
import { Popover } from '~components/popover';
import { Tooltip } from '~components/tooltip';

export type ExpandableToolItemType = string | ToolItem;

export type OnItemClick = (
  value: string,
  subItem?: ExpandableToolItemType,
) => void;

export interface ToolItem {
  value: string;
  label?: string;
  icon?: IconTypes;
  canActive?: boolean;
  isActive?: boolean;
  onClick?: OnItemClick;
  renderContent?: (item: ExpandableToolItem) => ReactNode;
}

export interface Expandable {
  items: ExpandableToolItemType[];
  active: ExpandableToolItemType;
  renderExpand: (item: ExpandableToolItem) => ReactNode;
}

export interface ExpandableToolItem extends ToolItem {
  expand?: Expandable;
}

export interface ToolProps extends ExpandableToolItem {}

const renderDefaultContent = ({
  isActive,
  canActive,
  value,
  icon,
  onClick,
}: ExpandableToolItem) => {
  return (
    <div
      className={`tool ${isActive && canActive ? 'active' : ''}`}
      onClick={() => onClick && onClick(value)}>
      {icon ? <Icon type={icon} /> : null}
    </div>
  );
};

export const Tool: FC<ToolProps> = (props) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const { label, expand, renderContent, onClick } = props;
  const handleClick: OnItemClick = (value, subItem) => {
    if (expand) {
      setPopoverVisible(false);
    }
    onClick && onClick(value, subItem);
  };
  const customProps = { ...props, onClick: handleClick };
  const content = renderContent
    ? renderContent(customProps)
    : renderDefaultContent(customProps);
  const expandContent = expand ? expand.renderExpand(customProps) : null;
  
  return (
    <Tooltip title={label ?? (expand?.active as ToolItem)?.label} placement="bottom">
      {expand ? (
        <Popover
          visible={popoverVisible}
          onVisibleChange={(visible) => setPopoverVisible(visible)}
          overlayClassName="expand-tools-popover"
          content={expandContent}
          trigger="click"
          placement="right">
          {content}
        </Popover>
      ) : (
        content
      )}
    </Tooltip>
  );
};
