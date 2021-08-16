import { useBoardContext, useCloudDriveContext } from 'agora-edu-core';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import Draggable from 'react-draggable';
import { Icon, TabPane, Tabs, transI18n } from '~ui-kit';
import { DownloadContainer } from './download';
import { StorageContainer } from './storage';
import { useUIStore } from '@/infra/hooks/'
import { PersonalStorageContainer } from './personal';

export type CloudDriveContainerProps = {
  onClose: () => void,
  onDelete?: (fileName: string) => void;
}

export const CloudDriverContainer: React.FC<CloudDriveContainerProps> = observer(({id}: any) => {
  const {
    setTool,
    room,
  } = useBoardContext()

  const {
    removeDialog
  } = useUIStore()

  const {
    refreshCloudResources,
  } = useCloudDriveContext()

  const [activeKey, setActiveKey] = useState<string>('1')

  useEffect(() => {
    if (activeKey === '2' || activeKey === '3') {
      refreshCloudResources()
    }
  }, [activeKey, refreshCloudResources])

  const handleChange = (key: string) => {
    setActiveKey(key)
  }

  const onCancel = React.useCallback(() => {
    if (room) {
    const tool = room.state.memberState.currentApplianceName
    setTool(tool)
    }
    removeDialog(id)
  }, [id, removeDialog, room, setTool])
  
  return (
    <Draggable>
      <div 
        className="agora-board-resources cloud-wrap"
      >
        <div className="btn-pin">
          <Icon type="close" style={{ cursor: 'pointer' }} onClick={() => {
            onCancel()
          }}></Icon>
        </div>
        <Tabs activeKey={activeKey} onChange={handleChange}>
          <TabPane tab={transI18n('cloud.publicResources')} key="1">
            <StorageContainer />
          </TabPane>
          <TabPane tab={transI18n('cloud.personalResources')} key="2">
            <PersonalStorageContainer />
          </TabPane>
          <TabPane tab={transI18n('cloud.downloadResources')} key="3">
            <DownloadContainer />
          </TabPane>
        </Tabs>
      </div>
    </Draggable>
  )
})





interface PaginationProps {
  style?: any,
  className?: string[],
  totalPages: number,
  onChange: (pageIdx: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  onChange
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const maxVisiblePages = 10;
  const cls = 'pagination';
  const changeActiveIdx = (pageIdx: number) => {
    if(pageIdx !== activeIdx) {
      setActiveIdx(pageIdx);
      onChange(pageIdx)
    }
  }
  

    let rightEdge = Math.min(activeIdx + maxVisiblePages / 2, totalPages - 1)
    let leftEdge = Math.max(activeIdx - (maxVisiblePages / 2 - 1), 0)

    // get initial windowSize
    let windowSize = (rightEdge - leftEdge) + 1

    if((rightEdge === totalPages - 1 || leftEdge === 0) && windowSize < maxVisiblePages) {
      // need more page elements
      if(rightEdge === totalPages - 1) {
        // if right edge reaches
        leftEdge = Math.max(0, leftEdge - (maxVisiblePages - windowSize))
      }
      if(leftEdge === 0) {
        rightEdge = Math.min(totalPages - 1, rightEdge + (maxVisiblePages - windowSize))
      }
    }

    // updated windowSize
    windowSize = (rightEdge - leftEdge) + 1
    return totalPages ? (
      <div className={cls}>
        {
          totalPages > 1 ? 
            <div className={activeIdx !== 0 ? "" : "invisible"} onClick={() => {changeActiveIdx(activeIdx - 1)}}>{transI18n("cloud.prev")}</div>
            : null
        }
        {
          totalPages === 0 ? null :
          Array(windowSize).fill(0).map((_,i) => {
            const pageIdx = leftEdge + i
            return (
              <div key={`paging-${i}`} onClick={() => {changeActiveIdx(pageIdx)}} className={pageIdx === activeIdx ? 'active':''}>{pageIdx + 1}</div>
            )
          })
        }
        {totalPages > 1 ? <div className={activeIdx !== totalPages - 1 ? "" : "invisible"} onClick={() => {changeActiveIdx(activeIdx + 1)}}>{transI18n("cloud.next")}</div> : null}
      </div>
    ) : null
}