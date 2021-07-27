import React from 'react'
import { Card } from '~components/card'
import { Icon } from '~components/icon'
import { BaseProps } from '~components/interface/base-props'

export interface HandsUpSenderProps extends BaseProps {
  state?: 'default' | 'actived' | 'forbidden';
  onClick: () => Promise<void> | void;
  animate?: number
}

export const HandsUpSender: React.FC<HandsUpSenderProps> = ({onClick, state = 'default', animate = 0}) => {

  const mapping = {
    'default': "#7B88A0",
    'actived': "#357BF6",
    'forbidden': "#BDBDCA"
  }

  const color = mapping[state==='forbidden'?'default':state]

  return (
    <Card
      className={["hands-up-sender", 'sender-can-hover'].join(" ")}
      width={40}
      height={40}
      borderRadius={40}
    >
      {/*TODO: fix hover */}
      <Icon type={state === 'actived' ? "hands-up" : "hands-up-student"} color={color} onClick={onClick} />
      {animate && state!=='forbidden'?<span className='handtip' onClick={onClick} >{animate}</span>:null} 
    </Card>
  )
}