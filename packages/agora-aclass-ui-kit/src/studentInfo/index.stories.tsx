import React from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import { AClassStudentInfo, AClassStudentInfoProps } from './index'

export default {
  title: '学生备课信息',
  argTypes: {
  }
}

export const AClassStudentInfoDemo = (props:AClassStudentInfoProps) => {
 return <AClassStudentInfo {...props} />

}
AClassStudentInfoDemo.args = {
}
