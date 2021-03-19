import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon';
import './index.css';

export type ZoomItemType =
    | 'max'
    | 'min'
    | 'zoom-out'
    | 'zoom-in'
    | 'backward'
    | 'forward'

export interface ZoomControllerProps extends BaseProps {
    zoomValue?: number;
    currentPage?: number;
    totalPage?: number;
    maximum?: boolean;
    clickHandler?: (type:  ZoomItemType) => void | Promise<void>;
}

export const ZoomController: FC<ZoomControllerProps> = ({
    zoomValue = 0,
    currentPage = 0,
    totalPage = 0,
    maximum = false,
    clickHandler = (e) => {console.log(e)},
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`zoom-controller`]: 1,
        [`${className}`]: !!className,
    });
    const fontSize = 28;
    const fontColor = '#7B88A0';
    return (
        <div className={cls} {...restProps}>
            { maximum ? 
                <Icon type="max" size={fontSize} color={fontColor} onClick={() => clickHandler('max')}/>
                :
                <Icon type="min" size={fontSize} color={fontColor} onClick={() => clickHandler('min')}/>
            }
            <Icon type="zoom-out" size={fontSize} color={fontColor} onClick={() => clickHandler('zoom-out')}/>
            <span className="zoom-value">{zoomValue}%</span>
            <Icon type="zoom-in" size={fontSize} color={fontColor} onClick={() => clickHandler('zoom-in')}/>
            <span className="line"></span>
            <Icon type="backward" size={fontSize} color={fontColor} onClick={() => clickHandler('backward')}/>
            <span className="page-info">
                {currentPage}/{totalPage}
            </span>
            <Icon type="forward" size={fontSize} color={fontColor} onClick={() => clickHandler('forward')}/>
        </div>
    )
}