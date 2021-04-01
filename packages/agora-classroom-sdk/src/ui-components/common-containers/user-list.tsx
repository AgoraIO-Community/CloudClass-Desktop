import { t, Roster } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'
import { useUserListContext } from '../hooks'

export const UserListContainer = observer(() => {

    const {dataSource, teacherName, onClick, role} = useUserListContext()

    return (
        <Roster
            role={role as any}
            teacherName={teacherName}
            dataSource={dataSource}
            onClick={onClick}
        />
    )
})