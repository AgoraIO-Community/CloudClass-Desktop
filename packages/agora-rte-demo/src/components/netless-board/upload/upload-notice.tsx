import React from 'react';

import './upload-notice.scss';
import { observer } from 'mobx-react';
import { useBoardStore } from '@/hooks';
import { useTimeout } from '@/components/toast';

const NoticeMessage: React.FC<any> = ({
  type,
  title,
  onClose
}) => {

  useTimeout(() => {
    onClose && onClose()
  }, 2500)

  return (
    <div className={`notice-container ${type}`}>
      <span className={`icon-${type}`}></span>
      <span className="title">{title}</span>
    </div>
  )
}

export const UploadNotice = observer(() => {

  const boardStore = useBoardStore()

  return (
    <div className="upload-notice">
      {boardStore.notices.map((it: any, idx: number) => 
        <NoticeMessage
          key={`${idx}${it.key}${Date.now()}`}
          type={it.type}
          title={it.title}
          onClose={() => boardStore.removeNotice(it)}
        />
      )}
    </div>
  )
})