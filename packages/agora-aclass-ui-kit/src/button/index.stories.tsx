import React from 'react'
import {Button} from '.'

export default {
  title: '按钮',
}

export const ConfirmButton: React.FC<void> = () => {
  return (
    <Button color="primary" text="Yes"></Button>
  )
}

export const CancelButton: React.FC<void> = () => {
  return (
    <Button color="secondary" text="No"></Button>
  )
}