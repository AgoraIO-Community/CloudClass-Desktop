import React, {useState} from 'react';
import './native-shared-window.scss';
import {CustomButton} from '@/components/custom-button';
import { useBreakoutRoomStore, useSceneStore } from '@/hooks'
import { observer } from 'mobx-react';
import { BizLogger } from '@/utils/biz-logger';

export const WindowItem: React.FC<any> = ({
  ownerName,
  name,
  className,
  windowId,
  image,
}) => {

  return (
    <div className={className ? className : ''} >
      <div className="screen-image">
        <div className="content" style={{ backgroundImage: `url(data:image/png;base64,${image})` }}>
        </div>
      </div>
      <div className="screen-meta">{name}</div>
    </div>
  )
}

export interface WindowListProps {
  title: string
  items: any[]
  windowId: number
  selectWindow: (windowId: any) => void
  confirm: (evt: any) => void
  cancel: (evt: any) => void
}

export const WindowList: React.FC<WindowListProps> = ({
  title,
  items,
  windowId,
  selectWindow,
  confirm,
  cancel
}) => {
  return (
    <div className="window-picker-mask">
      <div className="window-picker">
        <div className="header">
          <div className="title">{title}</div>
          <div className="cancelBtn" onClick={cancel}></div>
        </div>
        <div className='screen-container'>
          {
            items.map((it: any, key: number) =>
              <div className="screen-item" 
                key={key}
                onClick={() => {
                  selectWindow(it.windowId);
                }}
                onDoubleClick={confirm}
                >
                <WindowItem
                  ownerName={it.ownerName}
                  name={it.name}
                  className={`window-item ${it.windowId === windowId ? 'active' : ''}`}
                  windowId={it.windowId}
                  image={it.image}
                />
              </div>
            )
          }
        </div>
        <div className='footer'>
          <CustomButton className={'share-confirm-btn'} name={"start"}
            onClick={confirm} />
        </div>
      </div>
    </div>
  )
}

const NativeSharedWindowController = observer(() => {
  const sceneStore = useSceneStore()
  const breakoutRoomStore = useBreakoutRoomStore()

  var roomStatus = sceneStore.customScreenShareWindowVisible
  var breakoutRoomStatus = breakoutRoomStore.customScreenShareWindowVisible

  const [windowId, setWindowId] = useState<number>(0)

  return (
    (roomStatus || breakoutRoomStatus) ? 
    <WindowList
      windowId={windowId}
      title={'Please select and click window for share'}
      items={sceneStore.customScreenShareItems}
      cancel={() => {
        if(roomStatus) {
          sceneStore.removeScreenShareWindow()
        }
        if(breakoutRoomStatus) {
          breakoutRoomStore.removeScreenShareWindow()
        }
      }}
      selectWindow={(windowId: any) => {
        BizLogger.info('windowId', windowId)
        setWindowId(windowId)
      }}
      confirm={async (evt: any) => {
        if (!windowId) {
          BizLogger.warn("windowId is empty");
          return;
        }
        console.log('windowId confirm', windowId)
        if(roomStatus) {
          await sceneStore.startNativeScreenShareBy(windowId)
        }
        if(breakoutRoomStatus) {
          await breakoutRoomStore.startNativeScreenShareBy(windowId)
        }
      }}
    />
    : null
  )
})

export default function NativeSharedWindowContainer() {
  return (
    <NativeSharedWindowController />
  )
}