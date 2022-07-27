import classnames from 'classnames';
import React, { useState } from 'react';
import { BaseProps } from '~ui-kit/components/util/type';
import './index.css';

export interface TableBaseProps extends BaseProps {
  className?: string;
  children?: any;
  align?: 'center' | 'start' | 'end' | 'between' | 'around' | 'evenly';
  onClick?: (evt: any) => Promise<void> | void;
  hoverClass?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
}

export interface TableProps extends TableBaseProps {}

export const Table: React.FC<TableProps> = ({ className, children, align, ...restProps }) => {
  const cls = classnames({
    [`table-flex-container`]: 1,
    [`${className}`]: !!className,
    [`justify-${align}`]: !!align,
  });
  return (
    <div className={cls} {...restProps}>
      {children}
    </div>
  );
};

export interface ColProps extends TableBaseProps {
  width?: 9 | 20;
}

export const Col: React.FC<ColProps> = ({
  children,
  className,
  align,
  width,
  hoverClass,
  onMouseEnter,
  onMouseLeave,
  ...restProps
}) => {
  const [hovered, setHovered] = useState(false);
  const cls = classnames({
    'table-col-item': 1,
    [`${className}`]: !!className,
    [`justify-${align}`]: !!align,
    [`flex-width-${width}`]: !!width,
    [hoverClass!]: hovered,
  });

  return (
    <div
      className={cls}
      {...restProps}
      onMouseEnter={() => {
        setHovered(true);
        if (onMouseEnter) onMouseEnter();
      }}
      onMouseLeave={() => {
        setHovered(false);
        if (onMouseLeave) onMouseLeave();
      }}>
      {children}
    </div>
  );
};

export interface RowProps extends TableBaseProps {
  border?: 1;
  height?: 10;
  gap?: 10;
}

export const Row: React.FC<RowProps> = ({
  children,
  className,
  border,
  gap,
  align,
  height,
  hoverClass,
  onMouseEnter,
  onMouseLeave,
  ...restProps
}) => {
  const [hovered, setHovered] = useState(false);
  const cls = classnames({
    'table-row-item': 1,
    [`${className}`]: !!className,
    [`justify-${align}`]: !!align,
    [`border-bottom-width-${border}`]: !!border,
    [`table-row-x-${height}`]: !!height,
    [`item-gap-${gap}`]: !!gap,
    [hoverClass!]: hovered,
  });
  return (
    <div
      className={cls}
      {...restProps}
      onMouseEnter={() => {
        setHovered(true);
        if (onMouseEnter) onMouseEnter();
      }}
      onMouseLeave={() => {
        setHovered(false);
        if (onMouseLeave) onMouseLeave();
      }}>
      {children}
    </div>
  );
};

export interface ItemFontColorProps extends BaseProps {
  children: any;
  color?: string;
  width?: number;
  title?: string;
}

export const Inline: React.FC<ItemFontColorProps> = ({
  children,
  color,
  width,
  title = '',
  ...restProps
}) => {
  return (
    <span className="inline" style={{ color: color, width }} title={title} {...restProps}>
      {children}
    </span>
  );
};

export interface RowProps extends TableBaseProps {}

export const TableHeader: React.FC<RowProps> = ({ className, ...restProps }) => {
  const cls = classnames({
    'table-header': 1,
  });
  return <Row className={cls} {...restProps} />;
};
