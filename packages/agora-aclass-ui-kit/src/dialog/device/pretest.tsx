import { Box, InputLabel, MenuItem, Select } from '@material-ui/core'
import React from 'react'
import { DeviceTabs } from '.'
import {DeviceDialogPaper} from './paper'

const useStyles = () => ({

})

export interface IDeviceItem {
  name: string,
}

export interface DeviceItemProps {
  label: string,
  value: any,
  onChange: (newValue: any) => any,
  items: IDeviceItem[]
}

const DeviceItem: React.FC<DeviceItemProps> = (props) => {
  return (
    <React.Fragment>
      <InputLabel>{props.label}</InputLabel>
      <Select value={props.value} onChange={props.onChange}>
        {props.items.map((item: any, key: number) => (
          <MenuItem key={key} value={key}>{item.text}</MenuItem>
        ))}
      </Select>
    </React.Fragment>
  )
}


export interface DeviceTestProps {
  cameraList: IDeviceItem[],
  microphoneList: IDeviceItem[],
  onChangeCamera: (evt: any) => any,
  onChangeMicrophone: (evt: any) => any
}

export const DeviceTest: React.FC<DeviceTestProps> = (props) => {

  const classes = useStyles()
  
  const [value, setValue] = React.useState<number>(0)

  const onChange = (newValue: number) => {
    setValue(newValue)
  }

  const onCameraChange = (newValue: any) => {
    props.onChangeCamera(newValue)
  }

  const onChangeMicrophone = (newValue: any) => {
    props.onChangeMicrophone(newValue)
  }

  const cameraList = props.cameraList ? props.cameraList : []
  const microphoneList = props.microphoneList ? props.microphoneList : []

  return (
    <div style={{display: "flex", flexDirection: "row", width: 786, height: 660}}>
      <DeviceTabs value={value} onChange={onChange}/>
      <DeviceDialogPaper>
        <div style={{width: 700, height: 660, display: 'flex', flexDirection: 'column'}}>
          <DeviceItem
            label={'摄像头选项'}
            value={0}
            onChange={onCameraChange}
            items={[]}
          />
        </div>
        <div style={{width: 700, height: 660, display: 'flex', flexDirection: 'column'}}>
          <DeviceItem
            label={'麦克风选项'}
            value={0}
            onChange={onChangeMicrophone}
            items={[]}
          />
        </div>
        {/* <div style={{width: 700, height: 660, display: 'flex', flexDirection: 'column'}}>
          <DeviceItem
            label={'扬声器选项'}
            value={0}
          />
        </div> */}
      </DeviceDialogPaper>
    </div>
  )
}

DeviceTest.defaultProps = {
  cameraList: [],
  microphoneList: []
}