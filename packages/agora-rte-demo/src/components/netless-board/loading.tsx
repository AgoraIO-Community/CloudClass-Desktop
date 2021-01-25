import React from 'react';
import { Progress } from '../progress/progress';
import { t } from '@/i18n';
import { observer } from 'mobx-react';
import { useBoardStore } from '@/hooks';

export const BoardLoading = observer(() => {
  const boardStore = useBoardStore()
  return (
    boardStore.loadingType ? <Progress title={boardStore.loadingType === 'converting' ? t("whiteboard.converting") : t("whiteboard.loading")}></Progress> : null
  )
})