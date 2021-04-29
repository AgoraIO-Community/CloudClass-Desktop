import React, { FC, useCallback, useState } from 'react';
import { Icon } from '~components/icon';
import { Popover } from '~components/popover';
import { ToolItem } from './tool';
import { Slider } from '~components/slider'
import { Tooltip } from '~components/tooltip';

const defaultColors = [
  '#ffffff',
  '#9b9b9b',
  '#4a4a4a',
  '#000000',
  '#d0021b',
  '#f5a623',
  '#f8e71c',
  '#7ed321',
  '#9013fe',
  '#50e3c2',
  '#0073ff',
  '#ffc8e2',
];

export const hexToRgbaString = (hex: string, opacity: number): string => {
  return 'rgba(' + parseInt('0x' + hex.slice(1, 3)) + ',' + parseInt('0x' + hex.slice(3, 5)) + ','
          + parseInt('0x' + hex.slice(5, 7)) + ',' + opacity + ')';
}
export interface ColorsProps extends ToolItem {
  colors?: string[];
  activeColor?: string;
  colorSliderMin?: number;
  colorSliderMax?: number;
  colorSliderDefault?: number;
  colorSliderStep?: number;
  onClick?: (value: string) => void;
  onSliderChange?: (value: any) => void;
  hover?: boolean;
}

export const Colors: FC<ColorsProps> = ({
  label,
  colors = defaultColors,
  activeColor = '#7ed321',
  colorSliderMin = 0,
  colorSliderMax = 100,
  colorSliderDefault = 50,
  colorSliderStep = 1,
  hover = false,
  onClick,
  onSliderChange
}) => {
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
  const handleClick = (color: string) => {
    setPopoverVisible(!popoverVisible);
    onClick && onClick(color);
  };
  const content = useCallback(() => 
    (<div className={`expand-tools colors`}>
      <Slider
        style={{width: '100%'}}
        defaultValue={colorSliderDefault}
        min={colorSliderMin}
        max={colorSliderMax}
        step={colorSliderStep}
        onChange={onSliderChange}
      />
      {colors.map((color) => (
        <div
          key={color}
          onClick={() => handleClick(color)}
          className="expand-tool color"
          style={{
            borderColor: activeColor === color ? color : undefined,
          }}>
          <div className="circle" style={{ backgroundColor: color }} />
        </div>
      ))}
    </div>
  ), [colors, activeColor]);
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
          <div className="circle-border" style={{border: `1px solid ${hexToRgbaString(activeColor, 0.5)}`}}>
            <div className="circle" style={{backgroundColor: activeColor}}></div>
          </div>
          {/* <Icon type="circle" hover={hover} color={activeColor} /> */}
          <Icon type="triangle-down" className="triangle-icon"/>
        </div>  
      </Popover>
    </Tooltip>
  );
};
