import React, { useCallback, useState } from 'react'
import { useAsync, useAsyncFn } from 'react-use';
import { TextEllipsis } from '../typography'
import { makeStyles, Theme } from '@material-ui/core/styles'
import { WithIconButton } from "./control/button";
import translate from "./assets/translate.png";
import canTranslateIcon from "./assets/canTranslate.png";
import fail from "./assets/fail.png";
import { Loading } from "../loading";


export interface BubbleProps {
  userName: string,
  time: string,
  content: string,
  canTranslate: boolean,
  isSender: boolean,
  onClickTranslate: (evt?: any) => any,
  bubbleStyle?: React.CSSProperties,
  translateText?: string,
  translateButtonText?: string,
  loadingText?: string,
  failText?: string,
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
    marginTop: '10px',
    // justifyContent: 'space-between',
    width: 99,
  },
  senderContent: {
    display: 'flex',
    maxWidth: 200,
    padding: '9px 10px',
    whiteSpace: 'pre-wrap',
    overflow: 'hidden',
    lineHeight: '18px',
    backgroundColor: "#CBCCFF",
    color: '#2D3E6D',
    boxSizing: 'border-box',
    flexDirection: 'column',
    borderRadius: 8,
  },
  header: {
    marginBottom: 3,
    color: '#666',
    fontSize: 12,
    display: 'flex',
    marginTop: '10px',
    // justifyContent: 'space-between',
    width: 99,
  },
  content: {
    display: 'flex',
    maxWidth: 260,
    padding: '9px 10px',
    borderRadius: 8,
    whiteSpace: 'pre-wrap',
    overflow: 'hidden',
    lineHeight: '18px',
    color: '#2D3E6D',
    background: '#AADCF6',
    boxSizing: 'border-box',
    flexDirection: 'column'
  },
  chatMessage: {
    display: 'flex',
    flexDirection: 'row'
  },
  status: {
    margin: '0 6px'
  },
  translateText: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderTop: '1px solid #0000001a',
    lineHeight: '18px',
    paddingTop: '4px',
    marginTop: '3px'
  },
  loading: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderTop: '1px solid #0000001a',
    paddingTop: '4px',
    lineHeight: '18px',
    marginTop: '3px'
  },
  bubbleContent: {
    wordWrap: 'break-word',
    wordBreak: 'break-all',
    fontSize: 14
  }
}))


export const Bubble = (props: BubbleProps) => {
  const { bubbleStyle, isSender, time, content, userName, canTranslate, onClickTranslate, status, onClickFailButton, loadingText, failText } = props;
  const [isShowTranslateText, setIsShowTranslateText] = useState(false)
  const [translateText, setTranslateText] = useState('')
  const [bubbleCanTrans, setBubbleCanTrans] = useState(true)
  const classes = useStyles()
  const [state, fetch] = useAsyncFn(async (data) => {
    const response = await onClickTranslate(data);
    setIsShowTranslateText(true)
    setTranslateText(response.text)
    setBubbleCanTrans(false)
    return response
  });
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isSender ? 'flex-end' : 'flex-start',
    }}>
      <div className={isSender ? classes.senderHeader : classes.header}>
        <TextEllipsis maxWidth="27" style={{ color: '#415889', margin: '0 3px' }}>
          <React.Fragment>
            {userName}
          </React.Fragment>
        </TextEllipsis>
        <TextEllipsis maxWidth="19" style={{ color: '#B8C9DE' }}>
          <React.Fragment>
            {time}
          </React.Fragment>
        </TextEllipsis>
      </div>
      <div className={classes.chatMessage} style={isSender ? { flexDirection: 'row' } : { flexDirection: 'row-reverse' }}>
        <div className={classes.status}>
          {/* {canTranslate && bubbleCanTrans ? */}
          {status === 'loading' && <Loading />}
          {status === 'fail' && <WithIconButton onClick={() => onClickFailButton(props)} icon={fail} iconStyle={{ width: '18px', height: '18px' }} />}
        </div>
        <div style={{ ...bubbleStyle }} className={`${isSender ? classes.senderContent : classes.content} ${classes.bubbleContent}`}>
          <>{content}</>
          {isShowTranslateText ? <div className={classes.translateText}>{translateText}</div> : null}
          {state.loading ? <div className={classes.translateText}><Loading />{loadingText}</div> : state.error ? <div className={classes.translateText}>{failText}</div> : null}
          {!isShowTranslateText && !state.loading && !state.error ? 
              <div onClick={() => canTranslate && bubbleCanTrans && fetch({ ...props })} style={{cursor:'pointer', marginTop: 5, display:'flex', alignItems:'center' }}>
                <WithIconButton  
                    icon={canTranslate && bubbleCanTrans ? canTranslateIcon : translate} 
                    style={{ alignItems: 'flex-start'}}/>
                <span style={{padding: 5, color:'#4579FF'}}>{props.translateButtonText}</span>
              </div> : null}
        </div>
      </div>
    </div>
  )
}