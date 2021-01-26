import React from 'react'
import { action } from '@storybook/addon-actions'
import {AButton} from '.'

export default {
  title: '按钮',
}

export const ConfirmButton: React.FC<void> = () => {
  return (
    <AButton color="primary" text="Yes"></AButton>
  )
}

export const CancelButton: React.FC<void> = () => {
  return (
    <AButton color="secondary" text="No"></AButton>
  )
}