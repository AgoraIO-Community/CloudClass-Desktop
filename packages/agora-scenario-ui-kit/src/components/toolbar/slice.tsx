import React, { FC } from 'react';
import { Popover } from '~components/popover';
import { Tooltip } from '~components/tooltip';
import { ToolItem } from './tool';
import { SvgImg, SvgIcon, SvgIconEnum } from '~components/svg-img';
import { InteractionStateColors } from '~ui-kit/utilities/state-color';

export interface SliceItem {
  id: string;
  icon: React.ReactElement;
  name: string;
  disabled?: boolean;
}

export interface SliceProps extends ToolItem {
  slicersList: SliceItem[];
  onClick?: (value: string) => void;
  hover?: boolean;
}

export const Slice: FC<SliceProps> = ({ label, slicersList = [], onClick }) => {
  const handleClick = (cabinetId: string) => {
    onClick && onClick(cabinetId);
  };
  const content = () => (
    <div className={`expand-tools`}>
      {slicersList.map((item) => (
        <div
          className={`slice-item`}
          key={item.id}
          onClick={item.disabled ? () => { } : () => handleClick(item.id)}>
          <div className="slice-item-icon">{item.icon}</div>
          {item.name}
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
        <div className="tool">
          <SvgIcon
            type={SvgIconEnum.SLICE}
            hoverType={SvgIconEnum.SLICE}
            hoverColors={{ iconPrimary: InteractionStateColors.allow }}
          />
          <SvgImg size={6} type={SvgIconEnum.TRIANGLE_DOWN} className="triangle-icon" />
        </div>
      </Popover>
    </Tooltip>
  );
};
