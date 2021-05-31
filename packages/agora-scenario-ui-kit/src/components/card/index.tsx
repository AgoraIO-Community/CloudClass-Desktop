import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import './index.css';

export interface CardProps extends BaseProps {
    width?: number;
    height?: number;
    borderRadius?: number | string;
    children?: React.ReactNode;
}

export const Card: FC<CardProps> = ({
    width = 90,
    height = 90,
    borderRadius = 12,
    children,
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`card`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <div 
            className={cls}
            style={{
                width,
                height,
                borderRadius
            }} 
            {...restProps}
        >
            {children}
        </div>
    )
}