import { makeStyles, Theme } from '@material-ui/core'
import { CSSProperties } from '@material-ui/core/styles/withStyles'
import React from 'react'
import { CustomizeTheme } from '../../theme'
import { ControlBaseProps } from './declare'
import {Paginator} from './paginator'
import {ControlScale} from './scale'
import {ControlScreen} from './screen'

export interface ControlMenuProps extends ControlBaseProps {
  showPaginator: boolean,
  currentPage?: number,
  totalPage?: number,
  showScale: boolean,
  scale?: number,
  showControlScreen: boolean,
  isFullScreen: boolean,
  style?: CSSProperties
}


const usePaginatorStyles = makeStyles((theme: Theme) => ({
  root: {
    width: 230,
    height: 30,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 6.5,
    paddingBottom: 6.5,
    position: 'relative',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tools: {
    display: 'flex',
    borderRadius: 15,
    zIndex: 2,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  undertone: {
    width: '100%',
    height: '100%',
    display: 'block',
    background: '#8F9AD0',
    opacity: 0.3,
    borderRadius: 15,
    position: 'absolute',
    left: 0,
    top: 0
  }
}))

export const ControlMenu = (propArgs: ControlMenuProps) => {
  const {
    showPaginator,
    showScale,
    showControlScreen,
    currentPage,
    totalPage,
    scale,
    isFullScreen,
    onClick,
    ...props
  } = propArgs

  const classes = usePaginatorStyles()

  const currentPageNum = currentPage || 0
  const totalPageNum = totalPage || 0

  return (
    <CustomizeTheme>
      <div style={{...props.style, color: '#ffffff', fontSize: 8}} className={classes.root}>
        <div className={classes.tools}>
          {showPaginator ? <Paginator
            currentPage={currentPageNum}
            totalPage={totalPageNum}
            onClick={onClick}
          /> : null}
          {showScale ?
            <ControlScale
              onClick={onClick}
              scale={scale || 100}
            /> : null}
          {showControlScreen ?
            <ControlScreen
              isFullScreen={isFullScreen}
              onClick={onClick}
            /> : null}
        </div>
        <div className={classes.undertone}></div>
      </div>
    </CustomizeTheme>
  )
}