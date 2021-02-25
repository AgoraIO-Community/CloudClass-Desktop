import React, { useState, useEffect } from 'react';
import { TableRow } from '@material-ui/core';
import { diskAppStore, downloadStatus } from '@/monolithic/disk/disk-store';
import { iconMapper, DiskTableCell, DiskButton, DiskSingleProgress } from 'agora-aclass-ui-kit'
import {t} from '@/i18n'

interface DownloadTableRowProps {
  index: number,
  data: any,
  registerTaskCallback: (uuid: string, onProgress: (progress: number) => void, onComplete: () => void) => any,
  handleDownload: (uuid: string, onProgressCallback?: (progress: number) => void, onComplete?: () => void) => any,
  handleDeleteSingle: (evt: any) => any,
  handleClearcache: (evt: any) => any,
}

const DownloadTableRow = (props: DownloadTableRowProps) => {
  let row = props.data
  let index = props.index

  const [ status, setStatus ] = useState(props.data.status)
  const [ progress, setProgress ] = useState(props.data.progress)
  
  useEffect(() => {
    props.registerTaskCallback(props.data.resourceUuid, 
      (progress: number) => {
        setProgress(progress)
      },
      () => {
        setStatus(downloadStatus.cached)
        props.data.status = downloadStatus.cached
        props.data.progress = 100
      }
    )
  }, [])

  const handleDownload = (uuid: string, index: number) => {
    props.data.status = downloadStatus.downloading,
    setStatus(downloadStatus.downloading)
    props.handleDownload(uuid,
      (progress: number) => {
        setProgress(progress)
      },
      () => {
        setStatus(downloadStatus.cached)
        props.data.status = downloadStatus.cached
        props.data.progress = 100
      }
    )
  }

  const handleDeleteSingle = async (uuid: string) => {
    diskAppStore.deleteSingle(uuid).then(() => {
      row.status = downloadStatus.notCache
      row.progress = 0
      setStatus(row.status)
      setProgress(row.progress)
    })
  }

  return (
    <TableRow
      component="div"
      role="checkbox"
      tabIndex={-1}
      key={row.id}
    >
      <DiskTableCell
        style={{ paddingLeft: 15 }}
        scope="row"
        padding="none">
        <div style={{ display: 'flex' }}>
          <img src={iconMapper[row.type]} style={{ width: 22.4, height: 22.4 }} />
          <div style={{ 
            marginLeft: 5,
            width: 300,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>{row.resourceName}</div>
        </div>
      </DiskTableCell>
      <DiskTableCell
        style={{ color: '#586376' }}
        align="left">
        <DiskSingleProgress value={progress} />
      </DiskTableCell>
      <DiskTableCell
        style={{ color: '#586376' }}
        align="right"
      >
        {
          status === downloadStatus.notCache && 
          <>
            <DiskButton color={'primary'} onClick={() => handleDownload(row.resourceUuid, index)} id="disk-button-download" style={{ marginRight: 20 }} text={t('disk.download')} />
            <DiskButton color={'inherit'} id="disk-button-delete" text={t('disk.delete')} />
          </>
        }
        {
          status === downloadStatus.downloading &&
          <>
            <DiskButton color={'inherit'} id="disk-button-download" style={{ marginRight: 20 }} text={t('disk.downloading')} />
            <DiskButton color={'inherit'} id="disk-button-delete" text={t('disk.delete')} />
          </>
        }
        {
          status === downloadStatus.cached &&
          <>
            <DiskButton color={'inherit'} id="disk-button-download" style={{ marginRight: 20 }} text={t('disk.downloaded')} />
            <DiskButton color={'secondary'} onClick={() => handleDeleteSingle(row.resourceUuid)} id="disk-button-delete" text={t('disk.delete')} />
          </>
        }
      </DiskTableCell>
    </TableRow>
  )
}

export default DownloadTableRow