import { INavigationItem, Navigation, SignalBar, ActionButtons, StartView, Assistant, ExitButton} from 'agora-aclass-ui-kit'
import React from 'react'

export const Nav = () => {
  return (
    <Navigation
      background={'transparent'}
      leftContainer={statusBar}
      rightContainer={actionBar}
    />
  ) 
}

const userSignalStatus = [{
  userName: '1111',
  userUid: '111',
  signalLevel: 2,
  delay: 100,
  packagesLost: 11
}]

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
  { name: 'refresh', clickEvent: onRefresh },
  { name: 'customerService', clickEvent: onCustomerService },
  { name: 'equipmentDetection', clickEvent: onEquipmentDetection },
]

type IStatusBar = INavigationItem[]

const statusBar: IStatusBar = [{
  isComponent: false,
  componentKey: "classID",
  text: 'ClassID：1273827829'
},
// {
//   isComponent: true,
//   componentKey: "assistant",
//   renderItem: () => { return <Assistant userSignalStatus={userSignalStatus} /> }
// },
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