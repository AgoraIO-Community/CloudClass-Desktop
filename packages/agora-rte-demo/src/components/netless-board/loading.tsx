import React from 'react';
import { Progress } from '../progress/progress';
import { t } from '@/i18n';
import { observer } from 'mobx-react';
import { useBoardStore, useStatsStore } from '@/hooks';

// export const BoardLoading = observer(() => {
//   const boardStore = useBoardStore()
//   return (
//     boardStore.loadingType ? <Progress title={boardStore.loadingType === 'converting' ? t("whiteboard.converting") : t("whiteboard.loading")}></Progress> : null
//   )
// })

export const PPTProgress = observer(() => {
  const boardStore = useBoardStore()
  return (
    boardStore.downloading ? <Progress title={`下载中 ${boardStore.preloadingProgress}%`}></Progress> : null
  )
})

export const BoardProgress = observer(({
  onSkip
} : {
  onSkip: () => void
}) => {
  const statsStore = useStatsStore()
  return (
    statsStore.loadingStatus ? <Progress
      title={statsStore.loadingStatus.text}
      showSkip={statsStore.loadingStatus.type === 'downloading'}
      onSkip={() => {
        onSkip && onSkip()
      }} ></Progress> : null
  )
})

