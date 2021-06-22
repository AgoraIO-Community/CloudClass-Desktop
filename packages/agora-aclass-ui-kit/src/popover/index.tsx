import React from 'react'
import RcToolTip from 'rc-tooltip'
import './index.css'
import 'rc-tooltip/assets/bootstrap.css'

export interface PopoverProps {
    overlay: any,
    placement: string,
    visible: boolean,
    children?: any
}

export const Popover = (({
    overlay,
    placement,
    visible,
    children
}:PopoverProps) => {
    return (
        <RcToolTip
            overlay={overlay}
            placement={placement}
            overlayClassName="agpopover"
            visible={visible}
        >
            {children}
        </RcToolTip>
    )
})