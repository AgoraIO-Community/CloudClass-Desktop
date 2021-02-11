import { Box } from '@material-ui/core'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import React from 'react'
import { themeConfig } from '../theme'

export interface BoardProps {
  children?: any,
  style?: CSSProperties,
}

export const Board = ({children, style}: BoardProps) => {
  return (
    <Box style={{
      ...themeConfig.dialog.border,
      ...style
    }}>
      {children ? children : null}
    </Box>
  )
}


export * from './control'
export {
  Tool,
  IToolItem
} from './tool'
export {
  PanelBackground,
  ColorConfig,
  ColorPaletteProps,
  ColorPalette,
  StrokeSlider,
  CustomizeSliderProps,
  CustomizeSlider,
  VolumeSliderProps,
  VolumeSlider,
  IUploadItem,
  UploadProps,
  FileUploader,
  UploaderProps,
  UploadItemProps,
  CustomMenuItemBaseButtonProps,
  CustomMenuList,
  CustomMenuItemType,
  CustomMenuListProps,
} from './panel'