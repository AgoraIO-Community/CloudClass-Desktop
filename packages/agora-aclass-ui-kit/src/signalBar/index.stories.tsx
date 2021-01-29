import React from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import { SignalBar } from './index'

enum SignalRoleTypeEnum {
  None = 0,
  Level1 = 1,
  Level2 = 2,
  Level3 = 3,
}
interface ISignalBar {
  foregroundColor?: string,
  width?: string,
  level: SignalRoleTypeEnum
}

export default {
  title: '信号条',
  argTypes: {
    foregroundColor: { control: 'color' },
    level: {
      control: SignalRoleTypeEnum
    }
  }
}

export const EducationSignalBar = (props:ISignalBar) => {
 return <SignalBar {...props} />

}
EducationSignalBar.args = {
  foregroundColor: '#598bdd',
  width: '2em',
  level: SignalRoleTypeEnum.Level3
}
