import React from 'react';
import { CircularProgress, Button } from '@material-ui/core';
import { t } from '@/i18n';

type ProgressProps = {
  title: string,
  showSkip?: boolean,
  onSkip?: (e: React.MouseEvent<HTMLElement>) => void
  progress?: number
}

export const Progress: React.FC<ProgressProps> = ({
  title,
  showSkip,
  onSkip
}) => {
  
  return (
    <div className="progress-cover">
      <div className="progress">
        <div className="content">
          <CircularProgress className="circular"/>
          <span className="title">{title}...</span>
          {showSkip && <Button onClick={onSkip!} color="primary">{t("aclass.skip")}</Button>}
        </div>
      </div>
    </div>
  )
}

export const ProgressBar: React.FC<ProgressProps> = ({
  title,
  showSkip,
  onSkip,
  progress
}) => {
  
  return (
    <div className="progress-cover">
      <div className="progress-bar-container">
        <div className="content">
          <span className="title">{title}...</span>
          <div style={{display:'flex',flexDirection: 'row',alignItems:'center'}}>
            <div className="progress-bar">
              <div style={{width: `${progress}%`}} className="bar"></div>
            </div>
            <div className="progress-bar-text">{progress}%</div>
          </div>
        </div>
        {showSkip && <button onClick={onSkip!}>{t("aclass.skip")}</button>}
      </div>
    </div>
  )
}

export default React.memo(Progress);