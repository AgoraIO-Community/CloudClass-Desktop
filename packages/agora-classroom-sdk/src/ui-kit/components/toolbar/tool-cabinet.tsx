import React, { useCallback, FC, useState } from 'react';
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
    activeItem?: string;
    hover?: boolean;
}

export const ToolCabinet: FC<ToolCabinetProps> = ({
    label,
    cabinetList = [],
    onClick,
    activeItem = '',
    hover = false,
}) => {
    const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
    const handleClick = (cabinetId: string) => {
        setPopoverVisible(!popoverVisible);
        onClick && onClick(cabinetId);
    };
    const content = useCallback(() => (
        <div className={`expand-tools tool-cabinet`}>
            {cabinetList.map((item) => (
                <div className={`cabinet-item ${activeItem === item.id ? 'active' : ''}` } key={item.id} onClick={() => handleClick(item.id)}>
                    {item.icon}
                    <span>{item.name}</span>
                </div>
            ))}
        </div>
    ), [activeItem])
    return (
        <Tooltip title={label} placement="bottom" overlayClassName="translated-tooltip">
            <Popover
                visible={popoverVisible}
                onVisibleChange={(visible) => setPopoverVisible(visible)}
                overlayClassName="expand-tools-popover"
                trigger="hover"
                content={content}
                placement="right">
                <div className="tool">
                    <Icon type="tools" hover={hover} />
                    <Icon type="triangle-down" className="triangle-icon"/>
                </div>
            </Popover>
        </Tooltip>
    )
}