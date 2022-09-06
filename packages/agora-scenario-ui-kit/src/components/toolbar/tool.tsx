import React, { FC, ReactEventHandler } from 'react';
import { Tooltip } from '~components/tooltip';
import { SvgIcon } from '~components/svg-img';
import classnames from 'classnames';
import { BaseProps } from '../util/type';
import { SvgIconEnum } from '../svg-img/type';
import { useI18n } from '../i18n';
import { InteractionStateColors } from '~ui-kit/utilities/state-color';
export interface ToolItem extends BaseProps {
  value: string;
  label: any;
  icon: SvgIconEnum;
  isActive?: boolean;
  hover?: boolean;
  component?: React.FC<{
    isActive: boolean;
    onClick: ReactEventHandler<any>;
    hover?: boolean;
  }>;
}
export interface ToolProps extends ToolItem {
  onClick?: (value: string) => void;
}

export const Tool: FC<ToolProps> = (props) => {
  const {
    hover,
    value,
    label,
    icon,
    isActive = false,
    onClick = console.log.bind(`click ${props.value}`),
    component: Component,
    className,
  } = props;


  const t = useI18n();

  const handleToolClick = (value: any) => {
    onClick(value);
  };

  const cls = classnames('tool', {
    [`${className}`]: !!className,
  });

  return (
    <>
      {Component ? (
        <Component isActive={isActive} hover={hover} onClick={handleToolClick} />
      ) : (
        <Tooltip
          title={t(label)}
          placement="bottomLeft"
          overlayClassName="translated-tooltip"
          mouseLeaveDelay={0}
          align={{
            offset: [-5, 0],
          }}>
          <div className={cls}>
            <SvgIcon
              type={icon}
              hoverType={icon}
              colors={isActive ? {
                iconPrimary: InteractionStateColors.allow
              } : {}}
              hoverColors={{ iconPrimary: InteractionStateColors.allow }}
              onClick={() => handleToolClick && handleToolClick(value)}
            />
          </div>
        </Tooltip>
      )}
    </>
  );
};
