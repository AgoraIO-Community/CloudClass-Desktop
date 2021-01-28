import React from 'react'
import { Navigation } from '../navigation'
import { Board } from '../board'

interface LayoutProps {
  children?: any
}

export const FlexLayout = (props: LayoutProps) => {
  return (
    <div></div>
  )
}

export const OneToOne = () => {
  return (
    <div>
      <Navigation />
      <FlexLayout>
        <Board />
        {/* <Video /> */}
      </FlexLayout>
    </div>
  )
}