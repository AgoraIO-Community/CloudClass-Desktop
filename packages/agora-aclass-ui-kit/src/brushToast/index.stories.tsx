import React, { useEffect, useState } from 'react'
import { makeStyles, Theme } from '@material-ui/core'
import { BrushToast } from './index'

interface IBrushToast {
  icon?: React.ReactNode,
  text: string,
  position?: React.CSSProperties,
  disableIcon: boolean,
  isShowBrushToast: boolean
}
export const Demo = (props: IBrushToast) => {
  return <BrushToast {...props} />
}

Demo.args = {
  text: 'sjsjsj',
  isShowBrushToast: true,
  disableIcon: true
}

export default {
  title: '画笔toast',
  component: Demo,
  argTypes: {
    isShowBrushToast: Boolean,
    disableIcon: Boolean,
  }
}