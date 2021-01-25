import React, { EventHandler } from 'react';

interface CustomIconProps {
  ref?: any
  data?: string
  icon?: any
  loading?: boolean
  onMouseDown?: EventHandler<any>
  onMouseUp?: EventHandler<any>
  onMouseOut?: EventHandler<any>
  onClick?: EventHandler<any>
  className: string
  active?: any
  disable?: boolean
}
export const CustomIcon: React.FC<CustomIconProps> = (props) => {
  const {ref, data, icon, disable, className, onClick, active} = props
  const noop = () => {}

  const onMouseDown = props.onMouseDown ? props.onMouseDown : noop
  const onMouseUp = props.onMouseUp ? props.onMouseUp : noop
  const onMouseOut = props.onMouseOut ? props.onMouseOut : noop
  
  let iconClass = disable ? '' : (icon ? 'icon-btn' : 'icon');
  iconClass = active ? iconClass + " active" : iconClass;

  const dataName = data ? data : ''
  return (
    <div
      ref={ref}
      className={`${iconClass} ${className}`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseOut={onMouseOut}
      onTouchStart={onMouseDown}
      onTouchEnd={onMouseUp}
      onClick={onClick}
      data-name={dataName}
    ></div>
  )
}