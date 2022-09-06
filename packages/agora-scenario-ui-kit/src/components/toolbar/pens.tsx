import React, { FC, useCallback, useState } from 'react';
import { Popover } from '~components/popover';
import { Tooltip } from '~components/tooltip';
import { ToolItem } from './tool';
import { SvgImg, SvgIcon, SvgIconEnum } from '~components/svg-img';
import { Slider } from '~components/slider';
import { InteractionStateColors } from '~ui-kit/utilities/state-color';
import { getPenIcon, getPenShapeIcon } from './util';
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
  strokeWidthValue?: number;
  colorSliderStep?: number;
  paletteMap?: Record<string, string>;
  onColorClick?: (value: string) => void;
  onSliderChange?: (value: any) => void;
}

export const Pens: FC<PensProps> = ({
  label,
  pens = ['pen'],
  activePen = 'pen',
  isActive = false,
  onClick,
  colors = ['#7b88a0'],
  activeColor = '#7b88a0',
  colorSliderMin = 0,
  colorSliderMax = 100,
  strokeWidthValue = 5,
  colorSliderStep = 1,
  paletteMap = {},
  onColorClick,
  onSliderChange,
}) => {
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);

  const handleClick = (pen: string) => {
    onClick && onClick(pen);
  };

  const handleColorClick = (color: string) => {
    onColorClick && onColorClick(color);
  };

  const activePaletteColor = paletteMap[activeColor] || activeColor;

  const content = useCallback(
    () => (
      <div className={`expand-tools pens colors`}>
        <div className="flex flex-wrap justify-between">
          {
            pens.map((pen) => {
              const penIcon = getPenShapeIcon(pen);

              return (
                <div
                  key={pen}
                  onClick={() => handleClick(pen)}
                  className="expand-tool pen"
                  style={{ width: '21%' }}>
                  <SvgIcon
                    type={penIcon}
                    hoverType={penIcon}
                    colors={activePen === pen ? {
                      iconPrimary: activePaletteColor,
                    } : {}}
                  />
                </div>
              )
            })
          }
        </div>

        <div className="pens-colors-line"></div>

        <Slider
          style={{ width: '100%' }}
          defaultValue={strokeWidthValue}
          value={strokeWidthValue}
          min={colorSliderMin}
          max={colorSliderMax}
          step={colorSliderStep}
          onChange={onSliderChange}
        />

        <div className="pens-colors-line"></div>
        <div className="flex flex-wrap justify-between">
          {colors.map((color) => (
            <div
              key={color}
              onClick={() => handleColorClick(color)}
              className="expand-tool color"
              style={{
                border: activeColor === color ? `1px solid ${activePaletteColor}` : 'none',
              }}>
              <div
                className="circle"
                style={{
                  backgroundColor: color,
                  border: `1px solid ${paletteMap[color] || 'transparent'}`,
                }}
              />
            </div>
          ))}
        </div>
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
  const penIcon = getPenIcon(activePen);

  return (
    <Tooltip title={label} placement="bottom" overlayClassName="translated-tooltip" mouseLeaveDelay={0}>
      <Popover
        visible={popoverVisible}
        onVisibleChange={(visible) => {
          setPopoverVisible(visible);
        }}
        overlayClassName="expand-tools-popover"
        trigger="hover"
        content={content}
        placement="left">
        <div
          className="tool"
          onClick={() => {
            handleClickTool(activePen);
          }}>
          <SvgIcon
            type={penIcon}
            hoverType={penIcon}
            colors={
              isActive ? {
                penColor: activePaletteColor
              } : {}
            }
            hoverColors={{
              iconPrimary: InteractionStateColors.allow,
              penColor: InteractionStateColors.allow
            }}
          />
          <SvgImg type={SvgIconEnum.TRIANGLE_DOWN} className="triangle-icon" size={6} />
        </div>
      </Popover>
    </Tooltip>
  );
};
