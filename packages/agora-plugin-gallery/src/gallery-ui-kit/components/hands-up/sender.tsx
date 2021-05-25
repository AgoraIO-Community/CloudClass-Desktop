import React from 'react'
import { Card } from '~components/card'
import { Icon } from '~components/icon'
import { BaseProps } from '~components/interface/base-props'

export interface HandsUpSenderProps extends BaseProps {
  state?: 'default' | 'actived' | 'forbidden';
  onClick: () => Promise<void> | void;
}

export const HandsUpSender: React.FC<HandsUpSenderProps> = ({onClick, state = 'default'}) => {

  const mapping = {
    'default': "#7B88A0",
    'actived': "#357BF6",
    'forbidden': "#BDBDCA"
  }

  const color = mapping[state || 'default']

  return (
    <Card
      className={["hands-up-sender", state === 'forbidden' ? '' : 'sender-can-hover'].join(" ")}
      width={40}
      height={40}
      borderRadius={40}
    >
      {/*TODO: fix hover */}
      <Icon type={state === 'default' ? "hands-up-student" : "hands-up"} color={color} onClick={onClick} />
    </Card>
  )
}