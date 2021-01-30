import { Slider, withStyles, createStyles, Box, Grid } from '@material-ui/core'
import React, { useState } from 'react'
import {AClassTheme} from '../../theme'

const ASlider = withStyles({
  root: {
    color: '#000000',
    height: 3,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#000000',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

export const StrokeSlider = (props: any) => {

  const onChange = (_: unknown, newValue: number) => {
    props.onChange(newValue)
  }
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <ASlider value={props.value} onChange={onChange}/>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <span>细</span>
        <span>粗</span>
      </Box>
    </div>
  )
}

export interface CustomizeSliderProps {
  value: number,
  onChange: (newValue: number) => any
}

export const CustomizeSlider: React.FC<CustomizeSliderProps> = (props) => {
  return (
    <StrokeSlider valueLabelDisplay="auto" defaultValue={20} onChange={props.onChange} />
  )
}

CustomizeSlider.defaultProps = {
  value: 20
}