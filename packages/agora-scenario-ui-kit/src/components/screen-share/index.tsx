import React, { FC , useEffect, useState} from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Icon } from '~components/icon'
import './index.css';

interface WindowItem {
    id?: string | number;
    title?: string;
}

export interface ScreenShareProps extends BaseProps {
    screenShareTitle?: string;
    scrollHeight?: number;
    windowItems?: Array<WindowItem>[];
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
    let [activeIndex, setActiveIndex] = useState(-1)

    const activeValue = React.useRef<number>(activeIndex)

    useEffect(() => {
        activeValue.current = activeIndex
    }, [activeIndex])

    useEffect(() => {
        return () => {
            onConfirm(activeValue.current)
        }
    }, [activeValue, onConfirm])

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