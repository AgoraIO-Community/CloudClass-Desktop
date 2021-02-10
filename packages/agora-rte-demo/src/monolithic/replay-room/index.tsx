import { DelegateType } from '@/edu-sdk'
import { PlayerPage } from '@/pages/replay'
import { ConfirmDialog } from '@/components/dialog'
import { Toast, ToastContainer } from '@/components/toast'
import React from 'react'
import {render} from 'react-dom'
import { Provider } from 'mobx-react'
import { HashRouter } from 'react-router-dom'
import ThemeContainer from '@/containers/theme-container'
import { RoomComponentConfigProps, RoomConfigProps } from '@/edu-sdk/declare'
import { ReplayAppStore } from '@/stores/replay-app'

export const ReplayRoom = ({store,...props}: RoomConfigProps<ReplayAppStore>) => {
  window["replay"] = store

  return (
    <Provider store={store}>
      <ThemeContainer>
        <HashRouter>
          {/* <ConfirmDialog /> */}
          <PlayerPage />
        </HashRouter>
      </ThemeContainer>
    </Provider>
  )
}

export const RenderReplayRoom = ({dom, store, ...props}: RoomComponentConfigProps<ReplayAppStore>, delegate: DelegateType) => (
  render(
    <ReplayRoom {...props} store={store} />,
    dom
  )
)