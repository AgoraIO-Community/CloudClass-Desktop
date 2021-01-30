import { ButtonBase, makeStyles } from '@material-ui/core'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import React from 'react'
import { AClassTheme } from '../../theme'
import { rgbaToHexColor } from '../../utils'

const colorMap: Record<string, string> = {
  'red': rgbaToHexColor('rgb(252, 58, 63, 1.0)'),
  'orange': rgbaToHexColor('rgb(253, 131, 67, 1.0)'),
  'yellow': rgbaToHexColor('rgb(255, 218, 86, 1.0)'),
  'green1': rgbaToHexColor('rgb(159, 223, 118, 1.0)'),
  'green2': rgbaToHexColor('rgb(96, 232, 198, 1.0)'),
  'blue1': rgbaToHexColor('rgb(87, 178, 252, 1.0)'),
  'blue2': rgbaToHexColor('rgb(68, 134, 246, 1.0)'),
  // 'grape1': '',
  // 'grape2': '',
  'black': '#000000',
  'white': rgbaToHexColor('rgb(255, 255, 255, 0)'),
}

export const ColorConfig: string[] = Object.keys(colorMap).map((key: string) => colorMap[key])

export interface ColorPaletteProps {
  currentColor: string,
  activeStyles?: CSSProperties,
  colors?: string[],
  onClick: (evt: any) => any
}

const useStyles = makeStyles(() => ({
  colorBox: {
    display: 'flex',
    width: 150,
    flexWrap: 'wrap',
    boxSizing: 'border-box',
    backgroundColor: '#E9BE36',
    border: '2px solid #B98D00',
    borderRadius: 12,
    background: AClassTheme.backgroundColor,
    '& > div': {
      padding: 1,
      margin: 5,
      borderRadius: '50%',
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }
}))

export const ColorPalette: React.FC<ColorPaletteProps> = (props) => {

  const classes = useStyles()

  return (
    <div className={classes.colorBox}>
    {props.colors && props.colors.map((color: string, idx: number) => (
      <div key={idx} style={props.currentColor === color ? props.activeStyles : {}}>
        <ButtonBase
          disableRipple
          component="span"
          style={{backgroundColor: `${color}`, borderRadius: '50%', height: 32, width: 32, border: '1px solid #e4dede'}}
          onClick={() => props.onClick(color)}
        >
        </ButtonBase>
      </div>
    ))}
  </div>
  )
}

ColorPalette.defaultProps = {
  colors: ColorConfig,
  currentColor: colorMap['red'],
  activeStyles: {
    // borderRadius: '50%',
    // display: 'inline-block',
    border: '1px solid #39a1fd',
  }
}