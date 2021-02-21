import React from 'react';
import { Board } from './board';
import { observer } from 'mobx-react';
import { useBoardStore } from '@/hooks';
import { Progress } from '../progress/progress';
import { t } from '@/i18n';

export const NetlessBoard = observer((props: any) => {

  const {ready} = useBoardStore()

  return (
    ready ? <Board /> : <Progress title={t("whiteboard.loading")}></Progress>
  )
})