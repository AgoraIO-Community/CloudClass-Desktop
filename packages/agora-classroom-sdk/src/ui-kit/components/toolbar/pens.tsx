import React, { FC, useCallback, useState } from 'react';
import { Icon } from '~components/icon';
import { Popover } from '~components/popover';
import { Tooltip } from '~components/tooltip';
import { ToolItem } from './tool';

const defaultPens = [
    'pen',
    'square',
    'circle',
    'line'
]

export interface PensProps extends ToolItem {
    pens?: string[];
    activePen?: string;
    onClick?: (value: string) => void;
    isActive?: boolean;
}

export const Pens: FC<PensProps> = ({
    label,
    pens = defaultPens,
    activePen = 'pen',
    isActive = false,
    onClick,
}) => {
    const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
    const handleClick = (pen: string) => {
        setPopoverVisible(!popoverVisible);
        onClick && onClick(pen);
    };
    const content = useCallback(() => (
        <div className={`expand-tools pens`}>
            {pens.map((pen) => (
                <div
                    key={pen}
                    onClick={() => handleClick(pen)}
                    className="expand-tool pen"
                >
                    <Icon type={pen as any} className={activePen === pen ? 'active': ''} />
                    <div className={activePen === pen ? "current-pen" : ""} style={{ width: 3, height: 3 }}></div>
                </div>
            ))}
        </div>
    ), [pens, activePen]);
    return (
        <Tooltip title={label} placement="bottom">
            <Popover
                visible={popoverVisible}
                onVisibleChange={(visible) => setPopoverVisible(visible)}
                overlayClassName="expand-tools-popover"
                trigger="hover"
                content={content}
                placement="right">
                <div className="tool">
                    <Icon type={activePen as any} className={isActive ? 'active' : ''} />
                    <Icon type="triangle-down" className="triangle-icon" />
                </div>
            </Popover>
        </Tooltip>
    );
};
