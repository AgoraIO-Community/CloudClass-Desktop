import React from 'react'
import { Card } from '~components/card'
import { Icon } from '~components/icon'
import { BaseProps } from '~components/interface/base-props'

export interface HandsUpSenderProps extends BaseProps {
  isActive?: boolean,
  onClick: () => Promise<void> | void;
}

export const HandsUpSender: React.FC<HandsUpSenderProps> = ({onClick, isActive}) => {

  const color = isActive ? "#0073FF" : "#7B88A0"

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