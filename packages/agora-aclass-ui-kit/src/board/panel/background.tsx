import { styled } from '@material-ui/core/styles'
import { AClassTheme } from '../../theme'
import ToolbarBg from '../assets/popover-bg.png'

export const PanelBackground = styled('div')({
  backgroundImage: `url(${ToolbarBg})`,
  backgroundColor: '#E9BE36',
  border: '2px solid #B98D00;',
  borderRadius: 12
})