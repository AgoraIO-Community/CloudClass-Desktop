import React, { FC, useState } from 'react';
import { Popover } from '~components/popover';
import { Tooltip } from '~components/tooltip';
import clsn from 'classnames';
import { ToolItem } from './tool';
import { SvgImg, SvgIcon } from '~components/svg-img';

export interface CabinetItem {
  id: string;
  icon: React.ReactElement;
  name: string;
  disabled?: boolean;
}

export interface ToolCabinetProps extends ToolItem {
  cabinetList: CabinetItem[];
  onClick?: (value: string) => void;
  activeItems?: Set<string>;
  hover?: boolean;
}

export const ToolCabinet: FC<ToolCabinetProps> = ({
  label,
  cabinetList = [],
  onClick,
  activeItems = new Set(),
  hover = false,
}) => {
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
  const handleClick = (cabinetId: string) => {
    setPopoverVisible(false);
    onClick && onClick(cabinetId);
  };
  const content = () => (
    <div className={`expand-tools tool-cabinet`}>
      {cabinetList.map((item, idx, array) => {
        const cls = clsn('cabinet-item', {
          active: activeItems.has(item.id),
          'cabinet-item-last': idx + 1 > array.length - (array.length % 3),
        });

        return (
          <div
            className={cls}
            key={item.id}
            onClick={item.disabled ? () => {} : () => handleClick(item.id)}>
            {item.icon}
            <span>{item.name}</span>
          </div>
        );
      })}
    </div>
  );
  return (
    <Tooltip title={label} placement="bottom" overlayClassName="translated-tooltip">
      <Popover
        visible={popoverVisible}
        onVisibleChange={(visible) => setPopoverVisible(visible)}
        overlayClassName="tool-cabinet-popover"
        trigger="hover"
        content={content}
        placement="left">
        <div className="tool">
          <SvgIcon type="tools" canHover hoverType={'tools-active'} />
          <SvgImg size={6} type="triangle-down" className="triangle-icon" />
        </div>
      </Popover>
    </Tooltip>
  );
};
