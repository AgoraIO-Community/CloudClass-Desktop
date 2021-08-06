import React from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import { AClassVideoTutorial, AClassVideoTutorialProps } from './index'

export default {
  title: '视频教程',
  argTypes: {
  }
}

export const AClassVideoTutorialDemo = (props:AClassVideoTutorialProps) => {
 return <AClassVideoTutorial {...props} url="https://solutions-apaas.agora.io/acadsoc/static/guide.mp4" />

}
AClassVideoTutorialDemo.args = {
}
