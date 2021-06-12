import React from 'react';
import { CircularProgress, Button } from '@material-ui/core';
import { t } from '@/i18n';

type ProgressProps = {
  title: string,
  showSkip?: boolean,
  onSkip?: (e: React.MouseEvent<HTMLElement>) => void
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

export default React.memo(Progress);