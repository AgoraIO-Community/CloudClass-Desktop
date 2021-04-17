import { Roster } from '~ui-kit';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useUserListContext } from 'agora-edu-sdk';

export type UserListContainerProps = {
    onClose: () => void
}

export const UserListContainer: React.FC<UserListContainerProps> = observer((props) => {

    const {
        localUserUuid,
        myRole,
        teacherName,
        rosterUserList,
        handleRosterClick,
    } = useUserListContext()

    const onClick = async (actionType: any, uid: any) => {
        await handleRosterClick(actionType, uid)
    }

    return (
        <Roster
            isDraggable={true}
            localUserUuid={localUserUuid}
            role={myRole as any}
            teacherName={teacherName}
            dataSource={rosterUserList}
            onClick={onClick}
            onClose={props.onClose}
        />
    )
})