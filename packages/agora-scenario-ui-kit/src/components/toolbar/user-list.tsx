import React, { FC, useState } from 'react';
import { Popover } from '~components/popover';
import { ToolItem } from './tool';
import { Tooltip } from '~components/tooltip';
import { Icon } from '~components/icon';
import { Roster } from '~components/roster'

export interface UserListProps extends ToolItem {
    teacherName: string;
    columns?: any;
    dataSource?: any;
    onClick?: any;
}

export const UserList: FC<UserListProps> = ({
    label,
    teacherName,
    columns,
    dataSource,
    onClick
}) => {
    const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
    const content = (
        <div className={`expand-tools user-list`}>
            <Roster
                teacherName={teacherName}
                columns={columns}
                dataSource={dataSource}
                onClick={onClick}
            />
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
                <div className="tool">
                    <Icon type='register' />
                </div>
            </Popover>
        </Tooltip>
    );
}