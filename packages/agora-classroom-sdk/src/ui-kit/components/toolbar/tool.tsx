import React, { FC, ReactEventHandler } from 'react';
import {t} from '~components/i18n';
import { Icon, IconTypes } from '~components/icon';
import { Tooltip } from '~components/tooltip';
import { Popover } from '../popover';

export interface ToolItem {
  value: string;
  label: any;
  icon: IconTypes;
  isActive?: boolean;
  // render?: (tool: ToolItem) => ReactNode;
  component?: React.FC<{isActive: boolean, onClick: ReactEventHandler<any>}>
}
export interface ToolProps extends ToolItem {
  onClick?: (value: string) => void;
}

export const Tool: FC<ToolProps> = (props) => {
  const { value, label, icon, isActive = false, onClick = console.log.bind(`click ${props.value}`), component: Component } = props;
  return (
    <>
      {Component ? (
        // <Popover placement="right">
          <Component isActive={isActive} onClick={onClick} />
        // </Popover>
      ) : (
        <Tooltip title={t(label)} placement="bottom">
          <div
            className={`tool ${isActive ? 'active' : ''}`}
            onClick={() => onClick && onClick(value)}>
            {icon ? <Icon type={icon} /> : null}
          </div>
        </Tooltip>
      )}
    </>
  );
};
