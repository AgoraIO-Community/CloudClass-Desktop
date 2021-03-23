import classnames from 'classnames'
import React from 'react'
import { BaseProps } from '~components/interface/base-props'
import './index.css'

export interface TableBaseProps extends BaseProps {
  className?: string,
  children?: any,
  align?: 'center' | 'start' | 'end' | 'between' | 'around' | 'evenly'
  onClick?: (evt: any) => Promise<void> | void;
}

export interface TableProps extends TableBaseProps {}

export const Table: React.FC<TableProps> = ({className, children, align, ...restProps}) => {
  const cls = classnames({
    [`table-flex-container`]: 1,
    [`${className}`]: !!className,
    [`justify-${align}`]: !!align
  })
  return (
    <div className={cls} {...restProps}>
      {children}
    </div>
  )
}

export interface ColProps extends TableBaseProps {
  width?: 9 | 20
}

export const Col: React.FC<ColProps> = ({children, className, align, width, ...restProps}) => {
  const cls = classnames({
    'table-col-item': 1,
    [`${className}`]: !!className,
    [`justify-${align}`]: !!align,
    [`flex-width-${width}`]: !!width,
  })
  return (
    <div className={cls} {...restProps}>
      {children}
    </div>
  )
}

export interface RowProps extends TableBaseProps {
  border?: 1,
  height?: 10,
  gap?: 10,
}

export const Row: React.FC<RowProps> = ({children, className, border, gap, align, height, ...restProps}) => {
  const cls = classnames({
    'table-row-item': 1,
    [`${className}`]: !!className,
    [`justify-${align}`]: !!align,
    [`border-bottom-width-${border}`]: !!border,
    [`table-row-x-${height}`]: !!height,
    [`item-gap-${gap}`]: !!gap
  })
  return (
    <div className={cls} {...restProps}>
      {children}
    </div>
  )
}

export interface ItemFontColorProps extends BaseProps {
  children: any,
  color?: string,
  width?: number
}

export const Inline: React.FC<ItemFontColorProps> = ({
  children,
  color,
  width,
  ...restProps
}) => {
  return (
    <span className="inline" style={{color: color, width}} {...restProps}>
      {children}
    </span>
  )
}

export interface RowProps extends TableBaseProps {}

export const TableHeader: React.FC<RowProps> = ({className, ...restProps}) => {
  const cls = classnames({
    'table-header': 1
  })
  return (
    <Row className={cls} {...restProps} />
  )
}
export interface CheckBoxProps extends BaseProps {
  checked?: boolean,
  onClick?: (evt: any) => any,
  onChange?: (evt: any) => any,
  indeterminate?: boolean,
  className?: string,
}

export const CheckBox: React.FC<CheckBoxProps> = ({indeterminate, children, className, onChange, ...restProps}) => {

  const cls = classnames({
    'form-checkbox h-5 w-5 text-red-600': 1,
    [`indeterminate`]: indeterminate,
    [`${className}`]: !!className,
  })

  const mountDom = (dom: HTMLInputElement | null) => {
    dom && (dom.indeterminate = indeterminate!)
  }

  const handleChange = (evt: React.SyntheticEvent<HTMLInputElement>) => {
    indeterminate && (evt.currentTarget.indeterminate = !evt.currentTarget.checked)
    onChange && onChange(evt)
  }

  return (
    <input ref={mountDom} onChange={handleChange} type="checkbox" className={cls} {...restProps} />
  )
}