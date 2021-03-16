import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon';
import './index.css';

export interface ZoomControllerProps extends BaseProps {
    zoomValue?: number;
    currentPage?: number;
    totalPage?: number;
    clickHandler?: (e: React.MouseEvent<HTMLElement>) => void | Promise<void>;
}

export const ZoomController: FC<ZoomControllerProps> = ({
    zoomValue = 0,
    currentPage = 0,
    totalPage = 0,
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
        <div className={cls} {...restProps} onClick={clickHandler}>
            <Icon type="max" size={fontSize} color={fontColor}/>
            <Icon type="zoom-out" size={fontSize} color={fontColor}/>
            <span className="zoom-value">{zoomValue}%</span>
            <Icon type="zoom-in" size={fontSize} color={fontColor}/>
            <span className="line"></span>
            <Icon type="backward" size={fontSize} color={fontColor}/>
            <span className="page-info">
                {currentPage}/{totalPage}
            </span>
            <Icon type="forward" size={fontSize} color={fontColor}/>
        </div>
    )
}