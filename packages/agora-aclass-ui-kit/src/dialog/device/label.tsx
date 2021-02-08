import React from 'react'
import { withStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { InputLabel, MenuItem, Select } from '@material-ui/core'
import VideoDetectPng from '../assets/camera-detect.png'
export type DeviceList = {
  label: string,
  deviceId: string
}

const AClassSelect = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: 0,
    minWidth: '100%',
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    height: 30,
    '&$selected': { // <-- mixing the two classes
      backgroundColor: 'transparent'
    },
    '& .MuiSelect-select': {
      padding: 0,
      backgroundColor: '#000000',
      '&:focus': {
        backgroundColor: '#000000'
      }
    },
  },
  select: {
    '&$selected': {
      backgroundColor: 'transparent'
    },
    '&.MuiSelect-select': {
      padding: 0,
      backgroundColor: 'transparent',
      '&:focus': {
        backgroundColor: 'transparent'
      }
    },
  }
}))(Select);


export interface DeviceItemProps {
  name: string,
  value: any,
  defaultValue?: any,
  onChange: (evt: any) => any,
  list: DeviceList[],
  id?: string,
  selectStyle?: React.CSSProperties,
  pickerStyle?: React.CSSProperties,
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    // paddingLeft: 20,
    // paddingRight: 20,
    borderRadius: 30,
    background: '#DEF4FF',
    padding: 25,
    flex: 1,
  },
  settingContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 30,
    background: '#DEF4FF',
    padding: 25,
    flex: 1,
    justifyContent: 'space-between'
  },
  btnBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  select: {
    borderRadius: '20px',
    border: '1px solid #002591',
    minWidth: 260,
    '& .MuiInputBase-root': {
      display: 'flex'
    }
  },
  cameraDetect: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    background: `url(${VideoDetectPng}) no-repeat`,
    backgroundPosition: 'center',
    height: 147,
    backgroundSize: 56,
    width: 260,
    borderRadius: 10,
    backgroundColor: '#FFFFFF'
  },
  dialogHeader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dialogContent: {
    display: 'flex',
    // justifyContent: 'center',
  },
}))

export const DevicePicker: React.FC<DeviceItemProps> = (props) => {
  const classes = useStyles()
  return (
    <div className={classes.item} style={props.pickerStyle}>
      <InputLabel style={{color: '#002591', fontSize: '16px', marginRight: '13px'}} id={props.id}>{props.name}</InputLabel>
      <div className={classes.select} style={props.selectStyle}>
        <AClassSelect
          defaultValue={props.defaultValue}
          disableUnderline
          variant="standard"
          labelId={props.id}
          id={props.id}
          value={props.value}
          onChange={props.onChange}
          style={{
            paddingRight: 0,
          }}
          inputProps={{
            style: {}
          }}
        >
          {props.list.map((item: any, idx: number) => (
            <MenuItem key={idx} value={item.deviceId}>{item.label}</MenuItem>
          ))}
        </AClassSelect>
      </div>
    </div>
  )
}