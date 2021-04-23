import React from 'react'
import { Card } from '~components/card'
import { Icon } from '~components/icon'
import { BaseProps } from '~components/interface/base-props'
import apply from './assets/apply.png';
import coVideo from './assets/co-video.png';
import defaultHandsup from './assets/default.png';

export interface HandsUpSenderProps extends BaseProps {
  state?: 'default' | 'apply' | 'co-video';
  onClick: () => Promise<void> | void;
}

export const HandsUpSender: React.FC<HandsUpSenderProps> = ({onClick, state = 'default'}) => {

  const mapping = {
    'default': defaultHandsup,
    'apply': apply,
    'co-video': coVideo
  }

  const handsupStatus = mapping[state || 'default']
 
  return (
    <div className='handsupWrapper' onClick={ onClick }>
      <img src={handsupStatus} alt=""/>
    </div>
  )
}