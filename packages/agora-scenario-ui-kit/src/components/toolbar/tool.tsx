import React, { FC, ReactNode } from 'react';
import { Icon, IconTypes } from '~components/icon';
import { Popover } from '~components/popover';
import { Tooltip } from '~components/tooltip';

export type OnItemClick = (id: string, subId?: string) => void;

export interface ToolItem {
  id: string;
  label: string;
  icon: IconTypes;
}

export interface Expandable {
  render: (parentId: string, item: Partial<ToolItem>) => ReactNode;
  items: Partial<ToolItem>[];
}

export interface ExpandableToolItem extends ToolItem {
  expand?: Expandable;
}

export interface ToolProps extends ExpandableToolItem {
  onClick: OnItemClick;
  isActive: boolean;
}

export const Tool: FC<ToolProps> = ({
  id,
  label,
  expand,
  icon,
  isActive,
  onClick,
}) => {
  const content = (
    <div
      className={`tool ${isActive && !expand ? 'active' : ''}`}
      style={{ color: icon === 'color' ? id : undefined }}
      onClick={!expand ? () => onClick(id) : undefined}>
      <Icon type={icon} />
      {expand ? <Icon className="expandable" type={'triangle-down'} /> : null}
    </div>
  );
  const expandContent = (
    <div className={`expand-tools ${icon === 'color' ? 'colors' : ''}`}>
      {expand?.items.map((item) => (
        <div key={item.id} onClick={() => onClick(id, item.id)}>
          {!!expand ? expand.render(id, item) : null}
        </div>
      ))}
    </div>
  );
  return (
    <Tooltip title={label} placement="right">
      {expand ? (
        <Popover
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
