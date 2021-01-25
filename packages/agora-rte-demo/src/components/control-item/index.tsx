import React from 'react';
import {CustomIcon} from '@/components/icon';

interface ControlItemProps {
  name: string
  onClick: (name: string) => any | Promise<any>
  active: boolean
  text?: string
  loading?: boolean
}

export const ControlItem = (props: ControlItemProps) => {
  const onClick = (evt: any) => {
    props.onClick(props.name);
  }
  return (
    props.text ?
      <div className={`control-btn control-${props.name} ${props.loading ? 'icon-loading' : ''}`} onClick={onClick}>
        <div className={`btn-icon ${props.name} ${props.active ? 'active' : ''}`}
          data-name={props.name} />
        <div className="control-text">{props.text}</div>
      </div>
      :
      <CustomIcon
        loading={props.loading}
        data={props.name}
        onClick={onClick}
        className={`items ${props.name} ${props.active ? 'active' : ''}`}
      />
  )
}