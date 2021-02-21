import React from 'react';
import './index.scss';
import { Link } from 'react-router-dom';
import { t } from '@/i18n';
import { observer } from 'mobx-react';
import { useAppStore } from '@/hooks';
import { get } from 'lodash';
interface MessageProps {
  nickname: string
  content: string
  isUrl?: boolean
  link?: string
  sender?: boolean
  children?: any
  ref?: any
  className?: string
  role?: number
}

const roles = [
  'unknown',
  'teacher_role',
  'student_role',
  'assistant_role',
]

export const Message: React.FC<MessageProps> = observer(({
  nickname,
  content,
  isUrl,
  link,
  sender,
  children,
  ref,
  role,
  className
}) => {

  const appStore = useAppStore()

  const rtmUid = get(appStore.roomInfo, 'rtmUid', '')
  const rtmToken = get(appStore.roomInfo, 'rtmToken', '')

  return (
  <div ref={ref} className={`message ${sender ? 'sent': 'receive'} ${className ? className : ''}`}>
    <div className="nickname">
    {!sender && role? t(roles[role as number]) : ''}{nickname}
    </div>
    <div className="content">
      {link ?
        <Link to={`/replay/record/${link}?rtmUid=${encodeURIComponent(rtmUid)}&rtmToken=${encodeURIComponent(rtmToken)}`} target="_blank">{t('course_recording')}</Link>
        : 
        isUrl ?
        <div dangerouslySetInnerHTML={{__html: content}} />
        :
        content
      }
    </div>
    {children ? children : null}
  </div>
  )
})

interface RoomMessageProps extends MessageProps {
  roomName?: string
}

export const RoomMessage: React.FC<RoomMessageProps> = observer(({
  nickname,
  roomName,
  content,
  link,
  sender,
  children,
  ref,
  role,
  className
}) => {

  const appStore = useAppStore()

  const rtmUid = get(appStore.roomInfo, 'rtmUid', '')
  const rtmToken = get(appStore.roomInfo, 'rtmToken', '')

  return (
  <div ref={ref} className={`message ${sender ? 'sent': 'receive'} ${className ? className : ''}`}>
    {!sender && roomName && (<div className="roomname">{t('from_room')}{roomName}</div>)}
    <div className="nickname">
      {!sender && role ? t(roles[role as number]) : ''}{nickname}
    </div>
    <div className="content">
      {link ?
        <Link to={`/replay/record/${link}?rtmUid=${encodeURIComponent(rtmUid)}&rtmToken=${encodeURIComponent(rtmToken)}`} target="_blank">{t('course_recording')}</Link>
        : content
      }
    </div>
    {children ? children : null}
  </div>
  )
})