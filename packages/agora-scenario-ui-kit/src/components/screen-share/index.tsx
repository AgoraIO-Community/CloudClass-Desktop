import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon'
import './index.css';
import { useUnMount } from '~utilities/hooks';

type WindowId = string | number;
type WindowTitle = string | number;

interface WindowItem {
    id?: WindowId;
    title?: WindowTitle;
}

export interface ScreenShareProps extends BaseProps {
    screenShareTitle?: string;
    scrollHeight?: number;
    windowItems?: WindowItem[];
    onActiveItem: (id: WindowId) => void;
    onConfirm: ConfirmCallback;
    currentActiveId: WindowId;
}

type ConfirmCallback = (evt: any) => void

export const ScreenShare: FC<ScreenShareProps> = ({
    screenShareTitle,
    scrollHeight = 250,
    windowItems = [],
    className,
    currentActiveId,
    onActiveItem,
    onConfirm = (evt: any) => console.log('index', evt),
}) => {
    const cls = classnames({
        [`screen-share sub-title`]: 1,
        [`${className}`]: !!className,
    });

    useUnMount(() => onConfirm(currentActiveId))

    return (
        <>
            <div className={cls}>{screenShareTitle}</div>
            <div className={'programs'} style={{maxHeight: scrollHeight}}>
                {windowItems.map((item, index) => (
                    <div 
                        className={'program-item'} 
                        key={item.id} 
                        style={{borderColor: item.id === currentActiveId ? '#357BF6' : '#E8E8F2'}} 
                        onClick={() => {
                            onActiveItem(item.id!)
                        }}
                    >
                        <div className="program-item-img"></div>
                        <div className="program-item-title">
                            {item.id === currentActiveId  ? ( <Icon type="checked" size={16} color={'#357BF6'}/>) : ""}
                            <div className="title-text">{item.title}</div>
                        </div>
                    </div>
                ))}
            </div>
        </>    
    )
}