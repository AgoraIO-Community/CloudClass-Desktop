import React from 'react'
import { Card } from '~components/card'
import { Icon } from '~components/icon'
import { BaseProps } from '~components/interface/base-props'

export interface HandsUpSenderProps extends BaseProps {
  state?: 'default' | 'apply' | 'co-video';
  onClick: () => Promise<void> | void;
}

export const HandsUpSender: React.FC<HandsUpSenderProps> = ({onClick, state = 'default'}) => {

  const mapping = {
    'default': "#7B88A0",
    'apply': "#0073FF",
    'co-video': "#666666"
  }

  const color = mapping[state || 'default']

  return (
    <Card
      width={40}
      height={40}
      borderRadius={40}
    >
      <Icon hover={true} type="hands-up-student" color={color} onClick={onClick} />
    </Card>
  )
}