import React from 'react';
import { Meta } from '@storybook/react';
import { Register } from '~components/register';
import { PersonnelListType } from './index'

const meta: Meta = {
  title: 'Components/Register',
  component: Register,
};

const list: PersonnelListType[] = [
  {
    id: 'student-Lazy Cat',
    name: 'Lazy Cat',
    onStage: true,
    grantBoard: true,   // 白板授权
    cameraState: 0,   // 0 关闭 1开启
    microphoneState: 1,
    reward: 0,
    isKicked: false,
  },
  {
    id: 'student-Jin',
    name: 'Jin',
    onStage: false,
    grantBoard: false,
    cameraState: 0,
    microphoneState: 0,
    reward: 2,
    isKicked: false,
  },
  {
    id: 'student-旺达',
    name: '旺达',
    onStage: false,
    grantBoard: false,
    cameraState: 0,
    microphoneState: 1,
    reward: 1,
    isKicked: false,
  },
  {
    id: 'student-Vision',
    name: 'Vision',
    onStage: true,
    grantBoard: true,
    cameraState: 0,
    microphoneState: 1,
    reward: 0,
    isKicked: false,
  },
  {
    id: 'student-唐江娜',
    name: '唐江娜',
    onStage: true,
    grantBoard: false,
    cameraState: 1,
    microphoneState: 0,
    reward: 2,
    isKicked: false,
  },
  {
    id: 'student-Jay',
    name: 'Jay',
    onStage: false,
    grantBoard: true,
    cameraState: 1,
    microphoneState: 1,
    reward: 2,
    isKicked: false,
  },
  {
    id: 'student-lilycsvhjdvdvosxb',
    name: 'lilycsvhjdvdvosxb',
    onStage: true,
    grantBoard: false,
    cameraState: 0,
    microphoneState: 1,
    reward: 2,
    isKicked: false,
  },
  {
    id: 'student-旺财',
    name: '旺财',
    onStage: true,
    grantBoard: false,
    cameraState: 1,
    microphoneState: 0,
    reward: 2,
    isKicked: false,
  },
  {
    id: 'student-琪琪',
    name: '琪琪',
    onStage: false,
    grantBoard: false,
    cameraState: 0,
    microphoneState: 1,
    reward: 2,
    isKicked: false,
  },
]

export const Docs = () => {

  const handleClickEvent = (e: PersonnelListType) => {
    console.log('student --', e)
  }

  return (
    <>
      <Register
        role={'student'}
        userList={list}
        teacherName={'Lily Chou'}
        username={'Vision'}
        handleClickEvent={handleClickEvent}
      >
      </Register>
    </>
  )
}




export default meta;