import { FC, useState } from 'react';
import * as React from 'react';
import { Icon } from '~components/icon';
import { Popover } from '~components/popover';
import { Tooltip } from '~components/tooltip';
import { ToolItem } from './tool';

export interface CabinetItem {
    id: string;
    icon: React.ReactElement;
    name: string;
}

export interface ToolCabinetProps extends ToolItem { 
    cabinetList: CabinetItem[]
    onClick?: (value: string) => void;
}

export const ToolCabinet: FC<ToolCabinetProps> = ({
    label,
    cabinetList = [],
    onClick,
}) => {
    const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
    const handleClick = (cabinetId: string) => {
        setPopoverVisible(!popoverVisible);
        onClick && onClick(cabinetId);
    };
    const content = (
        <div className={`expand-tools tool-cabinet`}>
            {cabinetList.map((item) => (
                <div className="cabinet-item" key={item.id} onClick={() => handleClick(item.id)}>
                    {item.icon}
                    <span>{item.name}</span>
                </div>
            ))}
        </div>
    )
    return (
        <Tooltip title={label} placement="bottom">
            <Popover
                visible={popoverVisible}
                onVisibleChange={(visible) => setPopoverVisible(visible)}
                overlayClassName="expand-tools-popover"
                trigger="click"
                content={content}
                placement="right">
                <div className="tool">
                    <Icon type="tools" />
                    <Icon type="triangle-down" className="triangle-icon"/>
                </div>
            </Popover>
        </Tooltip>
    )
}