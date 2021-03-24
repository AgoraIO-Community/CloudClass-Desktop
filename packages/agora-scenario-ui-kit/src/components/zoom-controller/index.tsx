import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon';
import { Tooltip } from '~components/tooltip'
import './index.css';
import { t } from '~components/i18n';

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
    clickHandler?: (type: ZoomItemType) => void | Promise<void>;
}

export const ZoomController: FC<ZoomControllerProps> = ({
    zoomValue = 0,
    currentPage = 0,
    totalPage = 0,
    maximum = false,
    clickHandler = (e) => { console.log(e) },
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
                <Tooltip title={t('tool.fullScreen')} placement="top">
                    <Icon type="max" size={fontSize} color={fontColor} onClick={() => clickHandler('max')} />
                </Tooltip>
                :
                <Tooltip title={t('tool.reduction')} placement="top">
                    <Icon type="min" size={fontSize} color={fontColor} onClick={() => clickHandler('min')} />
                </Tooltip>
            }
            <Tooltip title={t('tool.zoomOut')} placement="top">
                <Icon type="zoom-out" size={fontSize} color={fontColor} onClick={() => clickHandler('zoom-out')} />
            </Tooltip>
            <span className="zoom-value">{zoomValue}%</span>
            <Tooltip title={t('tool.zoomIn')} placement="top">
                <Icon type="zoom-in" size={fontSize} color={fontColor} onClick={() => clickHandler('zoom-in')} />   
            </Tooltip>
            <span className="line"></span>
            <Tooltip title={t('tool.prev')} placement="top">
                <Icon type="backward" size={fontSize} color={fontColor} onClick={() => clickHandler('backward')} />
            </Tooltip>
            <span className="page-info">
                {currentPage}/{totalPage}
            </span>
            <Tooltip title={t('tool.next')} placement="top">
                <Icon type="forward" size={fontSize} color={fontColor} onClick={() => clickHandler('forward')} />   
            </Tooltip>
        </div>
    )
}