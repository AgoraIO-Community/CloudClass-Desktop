import React, { FC, ReactNode } from 'react';
import { Icon, IconTypes } from '~components/icon';
import { Tooltip } from '~components/tooltip';

export interface ToolItem {
  value: string;
  label: string;
  icon: IconTypes;
  isActive?: boolean;
  // render?: (tool: ToolItem) => ReactNode;
  component?: any;
}
export interface ToolProps extends ToolItem {
  onClick?: (value: string) => void;
}

export const Tool: FC<ToolProps> = (props) => {
  const { value, label, icon, isActive, onClick, component: Component } = props;
  // console.log(render, props)
  return (
    <>
      {Component ? (
        <Component />
        // React.cloneElement(Component)
      ) : (
        <Tooltip title={label} placement="bottom">
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
