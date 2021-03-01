import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import IconDraw from './assets/draw.png'

const useStyles = makeStyles(() => ({
  brushContainer: {
    position: 'fixed',
    top: '9%',
    left: '50%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    transform: 'translate(-50%, 0%)'
  },
  disableBrushContainer: {
    filter: 'grayscale(1)',
  },
  brush: {
    width: '42px',
    position: 'relative',
    zIndex: 2
  },
  tips: {
    background: '#2C2C2B',
    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.50)',
    borderRadius: '22px',
    color: '#fff',
    position: 'relative',
    left: '-30px',
    textAlign: 'center',
    maxHeight: '38px',
    minWidth: '130px',
    padding: '9px 9px 9px 19px',
    boxSizing: 'border-box'
  }
}))

interface IBrushToast {
  icon?: React.ReactNode,
  text: string,
  position?: React.CSSProperties,
  disableIcon: boolean,
  isShowBrushToast: boolean
}

export const BrushToast = (props: IBrushToast) => {
  const { icon, disableIcon, isShowBrushToast } = props
  const [isShowToast, setIsShowToast] = useState(isShowBrushToast);
  useEffect(() => {
    let timer:any;
    if (isShowBrushToast) {
      setTimeout(() => {
        setIsShowToast(false)
      }, 2000)
    }
    setIsShowToast(isShowBrushToast)
    return (() => { clearTimeout(timer) })
  }, [isShowBrushToast])

  const classes = useStyles()
  return (
    isShowToast && <div className={`${classes.brushContainer} ${disableIcon ? classes.disableBrushContainer : null}`} style={props.position}>
      {icon || <img className={classes.brush} src={IconDraw} />}
      <div className={classes.tips}>{props.text}</div>
    </div>
  )
}
