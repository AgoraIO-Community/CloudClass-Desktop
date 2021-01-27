import React from 'react'
import {Button} from '.'

export default {
  title: '按钮',
}

export const ConfirmButton = (props: any) => {
  return (
    <Button color={props.color} text={props.text}></Button>
  )
}

ConfirmButton.args = {
  color: 'primary',
  text: 'Yes'
}

export const CancelButton = (props: any) => {
  return (
    <Button color={props.color} text={props.text}></Button>
  )
}

CancelButton.args = {
  color: 'secondary',
  text: 'No'
}