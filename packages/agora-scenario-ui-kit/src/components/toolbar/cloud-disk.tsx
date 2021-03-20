import React, { FC, useState } from 'react';
import { Icon } from '~components/icon';
import { Popover } from '~components/popover';
import { Tooltip } from '~components/tooltip';
import { ToolItem } from './tool';
import { CourseWareManager } from '~components/table/index.stories'

export interface CloudDiskProps extends ToolItem { }

export const CloudDisk: FC<CloudDiskProps> = ({
    label
}) => {
    const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
    const content = (
        <div className={`expand-tools cloud-disk`}>
            <CourseWareManager/>
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
                    <Icon type="cloud" />
                </div>
            </Popover>
        </Tooltip>
    )
}