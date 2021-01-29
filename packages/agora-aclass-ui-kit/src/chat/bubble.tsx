import React from 'react'
import { TextEllipsis } from '../typography'
import { makeStyles, Theme } from '@material-ui/core'

export interface BubbleProps {
  userName: string,
  time: string,
  content: string,
  canTranslate: boolean,
  isSender: boolean,
  onClickTranslate: (evt: any) => any,
  bubbleStyle?: React.CSSProperties
}

const useStyles = makeStyles((theme: Theme) => ({
  senderHeader: {
    marginBottom: 3,
    color: '#666',
    fontSize: 12,
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: 99,
  },
  senderContent: {
    display: 'flex',
    maxWidth: 260,
    padding: '9px 10px',
    border: '1px solid #dbe2e5',
    whiteSpace: 'pre-wrap',
    overflow: 'hidden',
    lineHeight: '20px',
    color: '#333',
    boxSizing: 'border-box',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderTopRightRadius: 0,
  },
  header: {
    marginBottom: 3,
    color: '#666',
    fontSize: 12,
    display: 'flex',
    justifyContent: 'space-between',
    width: 99,
  },
  content: {
    display: 'flex',
    maxWidth: 260,
    padding: '9px 10px',
    border: '1px solid #dbe2e5',
    borderRadius: 8,
    borderTopLeftRadius: 0,
    whiteSpace: 'pre-wrap',
    overflow: 'hidden',
    lineHeight: '20px',
    color: '#333',
    boxSizing: 'border-box',
    justifyContent: 'space-between',
  }
}))

export const Bubble = ({bubbleStyle, isSender, time, content, userName, canTranslate, onClickTranslate}: BubbleProps) => {

  const onClick = onClickTranslate

  const classes = useStyles()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isSender ? 'flex-end' : 'flex-start'
    }}>
      <div className={isSender ? classes.senderHeader : classes.header}>
        <TextEllipsis maxWidth="27">
          <React.Fragment>
            {userName}
          </React.Fragment>
        </TextEllipsis>
        <TextEllipsis maxWidth="19">
        <React.Fragment>
            {time}
          </React.Fragment>
        </TextEllipsis>
      </div>
      <div style={{...bubbleStyle}} className={isSender ? classes.senderContent : classes.content}>
        <TextEllipsis maxWidth="162">
          <React.Fragment>
            {content}
          </React.Fragment>
        </TextEllipsis>
        {canTranslate ? <div onClick={onClick}>translate</div> : null}
      </div>
    </div>
  )
}