import { useBoardStore } from '@/hooks'
import { Colors, t, useI18nContext } from 'agora-scenario-ui-kit'
import { observer } from 'mobx-react'
import React from 'react'

const useColorContext = () => {
  const boardStore = useBoardStore()

  const activeColor = boardStore.currentColor
  const strokeWidth = boardStore.currentStrokeWidth
  return {
    activeColor,
    strokeWidth,
    changeStroke: (width: any) => {
      boardStore.changeStroke(width)
    },
    changeHexColor: (color: any) => {
      boardStore.changeHexColor(color)
    }
  }
}

export const ColorsContainer = observer(() => {

  const {
    activeColor,
    strokeWidth,
    changeHexColor,
    changeStroke
  } = useColorContext()

  const {t} = useI18nContext()

  return (
    <Colors
      value='color'
      label={t('scaffold.color')}
      icon='color'
      colorSliderMin={1}
      colorSliderMax={31}
      colorSliderDefault={strokeWidth}
      colorSliderStep={0.3}
      onSliderChange={changeStroke}
      activeColor={activeColor}
      onClick={changeHexColor}
    />
  )
})