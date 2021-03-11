import { Box } from '@material-ui/core'
import React from 'react'
import WaitingPng from './assets/waiting.png'
import LeftPng from './assets/left.png'
import NoAvailableCamera from './assets/no-camera.png'
import ClosedCamera from './assets/closed-camera.png'
import LoadingPng from './assets/loading-camera.png'
import OpeningCamera from './assets/open-camera.png'
import { TextEllipsis } from '../typography'

export interface PlaceHolderViewProps {
  role: PlaceHolderRole,
  type: PlaceHolderType,
  style?: React.CSSProperties,
  textEllipsisStyle?: React.CSSProperties,
  text?: string
}

export type PlaceHolderRole = 'teacher' | 'student'
export type PlaceHolderType = 'noEnter' | 'left' | 'noAvailableCamera' | 'closedCamera' | 'openingCamera' | 'loading' | 'none'

const iconPaths = {
  'teacher': {
    noEnter: WaitingPng,
    left: LeftPng,
    noAvailableCamera: NoAvailableCamera,
    loading: LoadingPng,
    closedCamera: ClosedCamera,
    openingCamera: OpeningCamera,
  },
  'student': {
    noEnter: WaitingPng,
    left: LeftPng,
    noAvailableCamera: NoAvailableCamera,
    loading: LoadingPng,
    closedCamera: ClosedCamera,
    openingCamera: OpeningCamera
  }
}


const PlaceHolderIcon: React.FC<{role: PlaceHolderRole, type: PlaceHolderType}> = (props) => {
  const iconPath = iconPaths[props.role][props.type]
  return (
    <img src={iconPath} style={{width: '54px', height: '54px'}} alt=""/>
  )
}

export const PlaceHolderView: React.FC<PlaceHolderViewProps> = (props) => {
  if (props.type === 'none') return <></>

  return (
    <Box style={props.style} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <PlaceHolderIcon role={props.role} type={props.type} />
      <TextEllipsis 
        style={{
          marginTop: '8px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#002591',
          
          ...props.textEllipsisStyle
        }}
        maxWidth="249">
        <>
          {props.text ? props.text : props.type}
        </>
      </TextEllipsis>
    </Box>
  )
}

PlaceHolderView.defaultProps = {
  role: 'student',
  type: 'noEnter',
  text: '',
  style: {}
}