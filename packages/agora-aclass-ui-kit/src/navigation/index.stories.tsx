import React from 'react'
import { Navigation } from './index'
import { INavigation, INavigationItem } from './interface'
import { SignalBar } from '../signalBar'
import { StartView, ActionButtons, ExitButton, Assistant } from './control'

type IStatusBar = INavigationItem[]
const onRefresh = () => {
  console.log('click onRefresh')
}
const onCustomerService = () => {
  console.log('click onCustomerService')
}
const onEquipmentDetection = () => {
  console.log('click onEquipmentDetection')
}
const onExitRoom = () => {
  console.log('click onExitRoom')
}
const buttonArr = [
  { name: 'highlight', tooltip: "test", clickEvent: onRefresh, count: 5 },
  { name: 'prepare', clickEvent: onRefresh },
  { name: 'refresh', clickEvent: onRefresh },
  { name: 'customerService', clickEvent: onCustomerService },
  { name: 'equipmentDetection', clickEvent: onEquipmentDetection },
]
const userSignalStatus = [{
  userName: '1111',
  userUid: '111',
  signalLevel: 2,
  delay: 100,
  packagesLost: 11
}]
const statusBar: IStatusBar = [{
  isComponent: false,
  componentKey: "classID",
  text: 'ClassID：1273827829'
},
{
  isComponent: true,
  componentKey: "assistant",
  renderItem: () => { return <Assistant userSignalStatus={userSignalStatus} /> }
},
{
  isComponent: true,
  componentKey: "classStartTime",
  renderItem: () => { return <StartView text='start in 10‘11"' /> }
},
{
  isComponent: true,
  componentKey: "signalBar",
  renderItem: () => { return <SignalBar level={2} width="18px" foregroundColor={'#ffffff'} /> }
}]
const actionBar: IStatusBar = [{
  isComponent: true,
  componentKey: "actionBar",
  renderItem: () => { return <ActionButtons buttonArr={buttonArr} /> }
},
{
  isComponent: true,
  componentKey: "exitButton",
  renderItem: () => { return <ExitButton text='Exit' onClick={onExitRoom} /> }
}]


export default {
  title: '导航栏',
  argTypes: {
    background: { control: 'color' },
    color: { control: 'color' },
    minHeight: { control: 'number' },
  }
}
export const EducationNavigation = (props: INavigation) => {

  const { leftContainer, background, rightContainer, rightContainerStyle, minHeight } = props
  return (
    <Navigation
      background={background}
      leftContainer={leftContainer}
      rightContainer={rightContainer}
      rightContainerStyle={rightContainerStyle}
      minHeight={minHeight}
    />

  )
}

EducationNavigation.args = {
  background: '#1D35AD',
  rightContainer: actionBar,
  leftContainer: statusBar,
}
