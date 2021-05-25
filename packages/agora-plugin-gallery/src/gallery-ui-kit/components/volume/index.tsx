import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import './index.css';

export interface VolumeProps extends BaseProps {
    backgroundColor?: string;
    activeColor?: string;
    width?: number;
    height?: number;
    currentVolume?: number;
    maxLength: number;
}

export const Volume: FC<VolumeProps> = ({
    backgroundColor = '#E2E2F0',
    activeColor = '#357BF6',
    width = 3,
    height = 12,
    currentVolume: currentVolume = 0,
    maxLength = 20,
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`volume`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <div className={cls} {...restProps}>
            {
                [..." ".repeat(maxLength)].map((item, index) => (
                    <div key={index} className={'volume-item'} style={{
                        width,
                        height,
                        backgroundColor: (index < currentVolume) ? activeColor : backgroundColor
                    }}>
                        {item}
                    </div>
                ))
            }
        </div>
    )
}