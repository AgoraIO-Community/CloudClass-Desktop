import React from 'react'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { NavigationControlButton, DefaultButton } from './button'

const useStyles = makeStyles((theme: Theme) => ({
  starIcon: {
    minWidth: '19px',
    minHeight: '19px',
    background: '#F34C76',
    border: '4px solid #FFFFFF',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '10px',
    boxSizing: 'border-box'
  },
  timeText: {
    color: 'red',
  }
}))

export const StartView = (props: { text: string, isEnd: any}) => {
  const { text, isEnd } = props;
  const styles = useStyles()
  return <>
    <span className={styles.starIcon}></span>
    { isEnd ?
      <span className={styles.timeText}>{text}</span>
      :
      <span>{text}</span>
    }
  </>
}
interface IActionItem {
  name: string,
  clickEvent?: () => any
}
interface IActionButtons {
  buttonArr: IActionItem[]
}

export const ActionButtons = (props: IActionButtons) => {

  return (
    <>
      {props.buttonArr.map((item: IActionItem) => {
        return <NavigationControlButton icon={item.name} key={item.name} onClick={item.clickEvent} />
      })}
    </>)
}

export const ExitButton = (props: { text: string, onClick: () => any }) => {
  return <DefaultButton {...props} />
}
export { LongMenu as Assistant } from './assistant'