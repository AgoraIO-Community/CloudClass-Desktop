import { DelegateType } from '@/edu-sdk'
import { PlayerPage } from '@/pages/replay'
import { ConfirmDialog } from '@/components/dialog'
import { Toast, ToastContainer } from '@/components/toast'
import React from 'react'
import {render} from 'react-dom'
import { Provider } from 'mobx-react'
import { MemoryRouter as Router } from 'react-router-dom'
import ThemeContainer from '@/containers/theme-container'
import { RoomComponentConfigProps, RoomConfigProps } from '@/edu-sdk/declare'

export const ReplayRoom = ({store,...props}: RoomConfigProps) => {
  window["replay"] = store

  return (
    <Provider store={store}>
      <ThemeContainer>
        <Router>
          {/* <ConfirmDialog /> */}
          <PlayerPage />
        </Router>
      </ThemeContainer>
    </Provider>
  )
}

export const RenderReplayRoom = ({dom, store, ...props}: RoomComponentConfigProps, delegate: DelegateType) => (
  render(
    <ReplayRoom {...props} store={store} />,
    dom
  )
)