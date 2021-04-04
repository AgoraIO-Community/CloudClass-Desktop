import { Roster } from 'agora-scenario-ui-kit';
import { observer } from 'mobx-react';
import React from 'react';
import Draggable from 'react-draggable';
import { useUserListContext } from '../hooks';

export type UserListContainerProps = {
    onClose: () => void
}

export const UserListContainer: React.FC<UserListContainerProps> = observer((props) => {

    const { dataSource, teacherName, onClick, role } = useUserListContext()

    return (
        <Draggable>
            <Roster
                role={role as any}
                teacherName={teacherName}
                dataSource={dataSource}
                onClick={onClick}
                onClose={props.onClose}
            />
        </Draggable>
    )
})