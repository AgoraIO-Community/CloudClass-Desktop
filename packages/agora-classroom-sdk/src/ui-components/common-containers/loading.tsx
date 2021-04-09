import { Card, Loading } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'
import { useLoadingContext } from '../hooks'

export const LoadingContainer = observer(() => {

  const {loading} = useLoadingContext()

  return loading ? <PageLoading /> : null
})

const PageLoading = () => {
  return (
    <Card width={90} height={90} className="card-loading-position">
      <Loading></Loading>
    </Card>
  )
}