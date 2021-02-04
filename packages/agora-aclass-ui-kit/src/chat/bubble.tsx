import React from 'react'
import { TextEllipsis } from '../typography'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { WithIconButton } from "./control/button";
import translate from "./assets/translate.png";
import fail from "./assets/fail.png";
import { Loading } from "../loading";


export interface BubbleProps {
  userName: string,
  time: string,
  content: string,
  canTranslate: boolean,
  isSender: boolean,
  onClickTranslate: (evt: any) => any,
  bubbleStyle?: React.CSSProperties,
  translateText?: string,
  status: 'loading' | 'fail' | 'success',
  onClickFailButton: (evt: any) => any,
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
    lineHeight: '2em',
    color: '#333',
    boxSizing: 'border-box',
    justifyContent: 'space-between',
  },
  chatMessage: {
    display: 'flex',
    flexDirection: 'row'
  },
  status: {
    margin: '0 6px'
  },
  translateText: {
    borderTop: '1px solid #0000001a',
    lineHeight: '2em'
  },
}))


export const Bubble = (props: BubbleProps) => {
  const { bubbleStyle, isSender, time, content, userName, canTranslate, onClickTranslate, translateText, status, onClickFailButton } = props;

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
      <div className={classes.chatMessage} style={isSender ? { flexDirection: 'row' } : { flexDirection: 'row-reverse' }}>
        <div className={classes.status}>
          {canTranslate ? <WithIconButton onClick={onClickTranslate} icon={translate} style={{ alignItems: 'flex-start', marginBottom: '10px' }} /> : null}
          {status === 'loading' && <Loading />}
          {status === 'fail' && <WithIconButton onClick={()=>onClickFailButton(props)} icon={fail} iconStyle={{ width: '18px', height: '18px' }} />}
        </div>
        <div style={{ ...bubbleStyle }} className={isSender ? classes.senderContent : classes.content}>
          <TextEllipsis maxWidth="162">
            <React.Fragment>
              {content}
              {translateText ? <div className={classes.translateText}>{translateText}</div> : null}
            </React.Fragment>
          </TextEllipsis>
        </div>
      </div>
    </div>
  )
}