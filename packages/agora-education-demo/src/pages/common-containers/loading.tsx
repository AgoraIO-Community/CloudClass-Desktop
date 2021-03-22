import { useRoomStore, useUIStore } from '@/hooks'
import { Card, Loading } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'

export const LoadingContainer = observer(() => {

  const uiStore = useUIStore()

  return uiStore.loading ? <PageLoading /> : null
})

const PageLoading = () => {
  return (
    <Card width={90} height={90} className="card-loading-position">
      <Loading></Loading>
    </Card>
  )
}