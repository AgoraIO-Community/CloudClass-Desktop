import React, { FC, useState } from 'react';
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
}

export const Pens: FC<PensProps> = ({
    label,
    pens = defaultPens,
    activePen = '#7ed321',
    onClick,
}) => {
    const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
    const handleClick = (pen: string) => {
        setPopoverVisible(!popoverVisible);
        onClick && onClick(pen);
    };
    const content = (
        <div className={`expand-tools pens`}>
            {pens.map((pen) => (
                <div
                    key={pen}
                    onClick={() => handleClick(pen)}
                    className="expand-tool pen"
                >
                    <Icon type={pen as any} />
                    <div className={activePen === pen ? "active-pen-div" : ""} style={{width: 3, height: 3}}></div>
                </div>
            ))}
        </div>
    );
    return (
        <Tooltip title={label} placement="bottom">
            <Popover
                visible={popoverVisible}
                onVisibleChange={(visible) => setPopoverVisible(visible)}
                overlayClassName="expand-tools-popover"
                trigger="click"
                content={content}
                placement="right">
                <Icon type={activePen as any}/>
            </Popover>
        </Tooltip>
    );
};
