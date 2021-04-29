import React, { FC, ReactEventHandler } from 'react';
import { t } from '~components/i18n';
import { Icon, IconTypes } from '~components/icon';
import { Tooltip } from '~components/tooltip';

export interface ToolItem {
  value: string;
  label: any;
  icon: IconTypes;
  isActive?: boolean;
  hover?: boolean;
  component?: React.FC<{isActive: boolean, onClick: ReactEventHandler<any>, hover?: boolean}>
}
export interface ToolProps extends ToolItem {
  onClick?: (value: string) => void;
}

export const Tool: FC<ToolProps> = (props) => {
  const { hover, value, label, icon, isActive = false, onClick = console.log.bind(`click ${props.value}`), component: Component } = props;

  const handleToolClick = (value: any) => {
    onClick(value)
  }

  return (
    <>
      {Component ? (
        <Component isActive={isActive} hover={hover} onClick={handleToolClick} />
      ) : (
        <Tooltip title={t(label)} placement="bottom" overlayClassName="translated-tooltip">
          <div
            className={`tool ${isActive ? 'active' : ''}`}
            >
            {icon ? <Icon hover={hover} type={icon} onClick={() => handleToolClick && handleToolClick(value)}></Icon> : null}
          </div>
        </Tooltip>
      )}
    </>
  );
};
