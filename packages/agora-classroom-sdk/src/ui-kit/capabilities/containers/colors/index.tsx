import { Colors, t } from '~ui-kit'
import { observer } from 'mobx-react'
import React from 'react'
import { useColorContext } from '~capabilities/hooks'


export const ColorsContainer = observer(() => {

  const {
    activeColor,
    strokeWidth,
    changeHexColor,
    changeStroke
  } = useColorContext()

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