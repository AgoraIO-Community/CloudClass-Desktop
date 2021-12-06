import { useMounted } from '~ui-kit/utilities/hooks';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '~components/icon';
import { Popover } from '~components/popover';
import { Tooltip } from '~components/tooltip';
import { ToolItem } from './tool';
import { SvgImg } from '~components/svg-img';
import { Slider } from '~components/slider';

const defaultPens = ['pen', 'square', 'circle', 'line'];

const defaultColors = [
  '#ffffff',
  '#9b9b9b',
  '#4a4a4a',
  '#000000',
  '#fc3a3f',
  '#f5a623',
  '#f8e71c',
  '#7ed321',
  '#9013fe',
  '#50e3c2',
  '#0073ff',
  '#ffc8e2',
];

const defaultActiveColor = '#7b88a0';

export const hexToRgbaString = (hex: string, opacity: number): string => {
  return (
    'rgba(' +
    parseInt('0x' + hex.slice(1, 3)) +
    ',' +
    parseInt('0x' + hex.slice(3, 5)) +
    ',' +
    parseInt('0x' + hex.slice(5, 7)) +
    ',' +
    opacity +
    ')'
  );
};

export interface PensProps extends ToolItem {
  pens?: string[];
  activePen?: string;
  onClick?: (value: string) => void;
  isActive?: boolean;
  colors?: string[];
  activeColor?: string;
  colorSliderMin?: number;
  colorSliderMax?: number;
  colorSliderDefault?: number;
  colorSliderStep?: number;
  onColorClick?: (value: string) => void;
  onSliderChange?: (value: any) => void;
}

export const Pens: FC<PensProps> = ({
  label,
  pens = defaultPens,
  activePen = 'pen',
  isActive = false,
  onClick,
  colors = defaultColors,
  activeColor = defaultActiveColor,
  colorSliderMin = 0,
  colorSliderMax = 100,
  colorSliderDefault = 50,
  colorSliderStep = 1,
  onColorClick,
  onSliderChange,
}) => {
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);

  const handleClick = (pen: string) => {
    // setPopoverVisible(!popoverVisible);
    onClick && onClick(pen);
  };

  const handleColorClick = (color: string) => {
    // setPopoverVisible(!popoverVisible);
    onColorClick && onColorClick(color);
  };

  const content = useCallback(
    () => (
      <div className={`expand-tools pens colors`}>
        {pens.map((pen) => (
          <div key={pen} onClick={() => handleClick(pen)} className="expand-tool pen">
            <SvgImg
              color={activePen === pen ? activeColor : defaultActiveColor}
              type={activePen === pen ? pen + '-active' : pen}
              // className={activePen === pen ? 'active' : ''}
              canHover
            />
            <div
              className={activePen === pen ? 'current-pen' : ''}
              style={{ width: 3, height: 3 }}></div>
          </div>
        ))}

        <div className="pens-colors-line"></div>

        <Slider
          style={{ width: '100%' }}
          defaultValue={colorSliderDefault}
          min={colorSliderMin}
          max={colorSliderMax}
          step={colorSliderStep}
          onChange={onSliderChange}
        />
        {colors.map((color) => (
          <div
            key={color}
            onClick={() => handleColorClick(color)}
            className="expand-tool color"
            style={{
              border:
                activeColor === color
                  ? `1px solid ${color === '#ffffff' ? '#E1E1EA' : color}`
                  : 'none', // 选中的才有边框颜色
            }}>
            <div
              className="circle"
              style={{
                backgroundColor: color,
                border: color === '#ffffff' ? '1px solid #E1E1EA' : 'none',
              }}
            />
          </div>
        ))}
      </div>
    ),
    [pens, activePen, handleClick, colors, activeColor, handleColorClick],
  );

  const handleClickTool = useCallback(
    (pen: string) => {
      handleClick(pen);
    },
    [handleClick, isActive],
  );
  return (
    <Tooltip title={label} placement="bottom" overlayClassName="translated-tooltip">
      <Popover
        visible={popoverVisible}
        onVisibleChange={(visible) => {
          setPopoverVisible(visible);
        }}
        overlayClassName="expand-tools-popover"
        trigger="hover"
        content={content}
        placement="right">
        <div
          className="tool"
          onClick={() => {
            handleClickTool(activePen);
          }}>
          <SvgImg
            color={isActive ? activeColor : defaultActiveColor}
            type={(activePen + (isActive ? '-active' : '')) as any}
            className={isActive ? 'active' : ''}
          />
          <SvgImg type="triangle-down" className="triangle-icon" style={{ position: 'absolute' }} />
        </div>
      </Popover>
    </Tooltip>
  );
};
