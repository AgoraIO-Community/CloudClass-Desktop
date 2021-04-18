import { useGlobalContext } from 'agora-edu-core'
import { observer } from 'mobx-react'
import { Card, Loading } from '~ui-kit'

export const LoadingContainer = observer(() => {

  const {loading} = useGlobalContext()

  return loading ? <PageLoading /> : null
})

const PageLoading = () => {
  return (
    <Card width={90} height={90} className="card-loading-position">
      <Loading></Loading>
    </Card>
  )
}