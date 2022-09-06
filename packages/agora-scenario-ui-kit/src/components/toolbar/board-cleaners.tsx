import React, { FC } from 'react';
import { Popover } from '~components/popover';
import { Tooltip } from '~components/tooltip';
import { ToolItem } from './tool';
import { SvgImg, SvgIcon, SvgIconEnum } from '~components/svg-img';
import { InteractionStateColors } from '~ui-kit/utilities/state-color';

export interface CleanerItem {
  id: string;
  icon: React.ReactElement;
  name: string;
  disabled?: boolean;
}

export interface BoardCleanersProps extends ToolItem {
  cleanersList: CleanerItem[];
  onClick?: (value: string) => void;
  activeItem?: string;
  hover?: boolean;
}

export const BoardCleaners: FC<BoardCleanersProps> = ({
  label,
  cleanersList = [],
  onClick,
  activeItem = '',
  isActive,
}) => {
  const handleClick = (cabinetId: string) => {
    onClick && onClick(cabinetId);
  };
  const content = () => (
    <div className={`expand-tools`}>
      {cleanersList.map((item) => (
        <div
          className={`cleaner-item ${activeItem === item.id ? 'active' : ''}`}
          key={item.id}
          onClick={item.disabled ? () => { } : () => handleClick(item.id)}>
          {item.icon}
        </div>
      ))}
    </div>
  );


  return (
    <Tooltip title={label} placement="bottom" overlayClassName="translated-tooltip" mouseLeaveDelay={0}>
      <Popover
        overlayClassName="expand-tools-popover expand-tools-popover-board-cleaner"
        trigger="hover"
        content={content}
        placement="left">
        <div className="tool" onClick={() => handleClick('eraser')}>
          <SvgIcon
            type={SvgIconEnum.ERASER}
            colors={isActive ? {
              iconPrimary: InteractionStateColors.allow
            } : {}}
            hoverType={SvgIconEnum.ERASER}
            hoverColors={{
              iconPrimary: InteractionStateColors.allow
            }}
          />
          <SvgImg size={6} type={SvgIconEnum.TRIANGLE_DOWN} className="triangle-icon" />
        </div>
      </Popover>
    </Tooltip>
  );
};
