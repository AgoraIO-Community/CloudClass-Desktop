import React, { FC , useEffect, useState, useRef} from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon'
import './index.css';

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
    onConfirm: ConfirmCallback;
}

type ConfirmCallback = (evt: any) => void

export const ScreenShare: FC<ScreenShareProps> = ({
    screenShareTitle,
    scrollHeight = 250,
    windowItems = [],
    className,
    onConfirm = (evt: any) => console.log('index', evt),
}) => {
    const cls = classnames({
        [`screen-share sub-title`]: 1,
        [`${className}`]: !!className,
    });
    let [activeIndex, setActiveIndex] = useState<number>(0)

    const activeValue = useRef<number>(activeIndex)
    useEffect(() => {
       activeValue.current = activeIndex;
    }, [activeIndex])

    useEffect(() => {
        return () => {
            onConfirm(windowItems[activeValue.current].id)
        }
    }, [activeValue, windowItems, onConfirm])

    return (
        <>
            <div className={cls}>{screenShareTitle}</div>
            <div className={'programs'} style={{maxHeight: scrollHeight}}>
                {windowItems.map((item, index) => (
                    <div 
                        className={'program-item'} 
                        key={item.id} 
                        style={{borderColor: index === activeIndex ? '#357BF6' : '#E8E8F2'}} 
                        onClick={() => {
                            setActiveIndex(index)
                        }}
                    >
                        <div className="program-item-img"></div>
                        <div className="program-item-title">
                            {index === activeIndex ? ( <Icon type="checked" size={16} color={'#357BF6'}/>) : ""}
                            <div className="title-text">{item.title}</div>
                        </div>
                    </div>
                ))}
            </div>
        </>    
    )
}