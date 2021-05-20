import { BaseProps } from '@/ui-kit/components/interface/base-props'
import { observer } from 'mobx-react'
import { Card, Loading } from '~ui-kit'
import { FC } from 'react'

export interface LoadingProps extends BaseProps {
  loading: boolean
}

export const LoadingContainer: FC<LoadingProps> = observer(({
  loading
}) => {
  return loading ? <PageLoading /> : null
})

const PageLoading = () => {
  return (
    <Card width={90} height={90} className="card-loading-position">
      <Loading></Loading>
    </Card>
  )
}