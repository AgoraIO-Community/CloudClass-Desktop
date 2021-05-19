import React, { FC, useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { IAgoraWidget, useAppPluginContext} from 'agora-edu-core';
import './index.css';
import { Dependencies } from '../ext-app/dependencies';
import {Adapter} from './adapter'


export interface WidgetProps extends BaseProps {
    widgetComponent: IAgoraWidget;
    widgetProps?: any;
}

export const Widget: FC<WidgetProps> = ({
    className,
    widgetComponent,
    widgetProps = {},
    ...restProps
}) => {
    const ref = useRef<HTMLDivElement | null>(null)
    const {contextInfo} = useAppPluginContext()

    const {userUuid, userName, userRole, roomName, roomUuid, roomType, language} = contextInfo
    
    const {events, actions} = Adapter()
    const context = {
      // properties: properties,
      events,
      actions,
      dependencies: Dependencies,
      localUserInfo: {
        userUuid: userUuid,
        userName: userName,
        roleType: userRole
      },
      roomInfo: {
        roomName,roomUuid,roomType
      },
      language: language
    }
    
    useEffect(() => {
        if (ref.current && widgetComponent) {
            // only run for very first time
            widgetComponent.widgetDidLoad(ref.current, context, widgetProps)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, widgetComponent])

    const cls = classnames({
        [`${className}`]: !!className,
    });
    return (
        <div ref={ref} className={cls} {...restProps}>
            
        </div>
    )
}