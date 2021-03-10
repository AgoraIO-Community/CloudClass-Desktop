import classnames from 'classnames'
import React from 'react'
import { BaseProps } from '~components/interface/base-props'
import './index.css'

export interface TableBaseProps extends BaseProps {
  className?: string,
  children?: any,
  align?: 'center' | 'start' | 'end' | 'between' | 'around' | 'evenly'
}

export interface TableProps extends TableBaseProps {}

export const Table: React.FC<TableProps> = ({className, children, align, ...restProps}) => {
  const cls = classnames({
    ['table-flex-container']: 1,
    [`${className}`]: !!className,
    [`justify-${align}`]: !!align
  })
  return (
    <div className={cls} {...restProps}>
      {children}
    </div>
  )
}

export interface ColProps extends TableBaseProps {}

export const Col: React.FC<ColProps> = ({children, className, align, ...restProps}) => {
  const cls = classnames({
    ['table-col-item']: 1,
    [`${className}`]: !!className,
    [`justify-${align}`]: !!align
  })
  return (
    <div className={cls} {...restProps}>
      {children}
    </div>
  )
}

export interface RowProps extends TableBaseProps {}

export const Row: React.FC<RowProps> = ({children, className, align, ...restProps}) => {
  const cls = classnames({
    ['table-row-item']: 1,
    [`${className}`]: !!className,
    [`justify-${align}`]: !!align
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
}

export const Inline: React.FC<ItemFontColorProps> = ({
  children,
  color,
  ...restProps
}) => {
  return (
    <span style={{color: color}} {...restProps}>
      {children}
    </span>
  )
}

export interface RowProps extends TableBaseProps {}

export const TableHeader: React.FC<RowProps> = ({children, className, align, ...restProps}) => {
  const cls = classnames({
    ['table-header']: 1,
    [`justify-${align}`]: !!align,
  })
  return (
    <div className={cls} {...restProps}>
      {children}
    </div>
  )
}

export type ProgressType = 
  | 'download'

export interface ProgressProps extends BaseProps {
  progress: number,
  width: number,
  type: ProgressType
}

export const Progress: React.FC<ProgressProps> = ({
  progress, width, children, className, style,
  type,
  ...restProps}) => {

  const cls = classnames({
    [`${className}`]: !!className,
  })

  const bgCls = classnames({
    [`overflow-hidden h-2 text-xs flex rounded bg-${type}-bg`]: 1,
  })

  const fgCls = classnames({
    [`bg-${type}-fg`]: 1,
  })

  const progressWidth = progress * 100
  
  return (
    <div className={cls} style={{
      width: width,
      ...style
    }} {...restProps}>
      <div className={bgCls}>
        <div className={fgCls} style={{width: `${progressWidth}%`}}></div>
      </div>
    </div>
  )
}