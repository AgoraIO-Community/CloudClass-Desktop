import React, { useCallback, FC, useState } from 'react';
import { Popover } from '~components/popover';
import { Tooltip } from '~components/tooltip';
import { ToolItem } from './tool';
import { transI18n } from '~components/i18n';
import { SvgImg } from '~components/svg-img';

export interface CabinetItem {
  id: string;
  icon: React.ReactElement;
  name: string;
  disabled?: boolean;
}

export interface ToolCabinetProps extends ToolItem {
  cabinetList: CabinetItem[];
  onClick?: (value: string) => void;
  activeItem?: string;
  hover?: boolean;
}

export const ToolCabinet: FC<ToolCabinetProps> = ({
  label,
  cabinetList = [],
  onClick,
  activeItem = '',
  hover = false,
}) => {
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
  const handleClick = (cabinetId: string) => {
    setPopoverVisible(false);
    onClick && onClick(cabinetId);
  };
  const content = useCallback(
    () => (
      <div className={`expand-tools tool-cabinet`}>
        {cabinetList.map((item) => (
          <div
            className={`cabinet-item ${activeItem === item.id ? 'active' : ''}`}
            key={item.id}
            onClick={item.disabled ? () => {} : () => handleClick(item.id)}>
            {item.icon}
            <span>
              {['countdown'].includes(item.name) ? transI18n(`${item.name}.appName`) : item.name}
            </span>
          </div>
        ))}
      </div>
    ),
    [activeItem],
  );
  return (
    <Tooltip title={label} placement="bottom" overlayClassName="translated-tooltip">
      <Popover
        visible={popoverVisible}
        onVisibleChange={(visible) => setPopoverVisible(visible)}
        overlayClassName="expand-tools-popover"
        trigger="hover"
        content={content}
        placement="right">
        <div className="tool">
          <SvgImg type="tools" />
          <SvgImg type="triangle-down" className="triangle-icon" style={{ position: 'absolute' }} />
        </div>
      </Popover>
    </Tooltip>
  );
};
