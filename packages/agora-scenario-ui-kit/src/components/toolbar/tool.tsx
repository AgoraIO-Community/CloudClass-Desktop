import React, { FC, ReactEventHandler } from 'react';
import { IconTypes } from '~components/icon';
import { Tooltip } from '~components/tooltip';
import { SvgIcon } from '~components/svg-img';
import classnames from 'classnames';
import { BaseProps } from '../interface/base-props';
import { useI18n } from '../i18n';

export interface ToolItem extends BaseProps {
  value: string;
  label: any;
  icon: IconTypes;
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
          align={{
            offset: [-5, 0],
          }}>
          <div className={cls}>
            {icon ? (
              <SvgIcon
                type={isActive ? icon + '-active' : icon}
                hoverType={icon + '-active'}
                canHover
                onClick={() => handleToolClick && handleToolClick(value)}
              />
            ) : null}
          </div>
        </Tooltip>
      )}
    </>
  );
};
