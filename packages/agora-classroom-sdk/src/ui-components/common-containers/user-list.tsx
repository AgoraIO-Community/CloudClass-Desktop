import { useBoardStore } from '@/hooks'
import { t, useI18nContext, UserList } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'
import { useUserListContext } from '../hooks'

export const UserListContainer = observer(() => {

    const {dataSource, teacherName, onClick} = useUserListContext()

    return (
        <UserList
            value='register'
            label={t('scaffold.user_list')}
            icon='register'
            teacherName={teacherName}
            dataSource={dataSource}
            onClick={onClick}
        />
    )
})