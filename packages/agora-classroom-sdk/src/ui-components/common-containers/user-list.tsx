import { useBoardStore } from '@/hooks'
import { useI18nContext, UserList } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'

export const UserListContainer = observer(() => {

    const { t } = useI18nContext()
    const boardStore = useBoardStore()

    return (
        <UserList
            value='register'
            label={t('scaffold.user_list')}
            icon='register'
            teacherName="Peter"
            dataSource={[...'.'.repeat(100)].map((item, i: number) => ({
                uid: i,
                name: 'Lily True ' + (i + 1),
                onPodium: false,
                whiteboardGranted: true,
                cameraEnabled: false,
                micEnabled: true,
                stars: 2,
                canTriggerAction: true,
            }))}
        />
    )
})