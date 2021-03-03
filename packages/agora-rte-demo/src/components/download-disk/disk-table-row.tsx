import React from 'react';
import { TableRow } from '@material-ui/core';
import { iconMapper, DiskTableCell, DiskButton, DiskSingleProgress } from 'agora-aclass-ui-kit'
import {t} from '@/i18n'
import { DownloadFileStatus } from '@/stores/storage';
import { useStorageStore } from '@/hooks';
import { observer } from 'mobx-react';

interface DownloadTableRowProps {
  index: number,
  data: any,
  handleDownload: (uuid: string, onProgressCallback?: (progress: number) => void, onComplete?: () => void) => any,
  handleDeleteSingle: (evt: any) => any,
}

export const DownloadTableRow = observer((props: DownloadTableRowProps) => {
  const row = props.data
  const index = props.index

  const status = row.status
  
  const progressMap = useStorageStore().progressMap

  const progress = progressMap[row.resourceUuid]

  const handleDownload = (uuid: string, _: number) => {
    props.handleDownload(uuid)
  }

  const handleDeleteSingle = async (uuid: string) => {
    props.handleDeleteSingle(uuid)
  }

  return (
    <TableRow
      component="div"
      role="checkbox"
      tabIndex={-1}
      key={row.resourceUuid}
    >
      <DiskTableCell
        style={{ paddingLeft: 15}}
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
          status === DownloadFileStatus.NotCached && 
          <>
            <DiskButton color={'primary'} onClick={() => handleDownload(row.resourceUuid, index)} id="disk-button-download" style={{ marginRight: 20 }} text={t('disk.download')} />
            <DiskButton color={'inherit'} id="disk-button-delete" text={t('disk.delete')} />
          </>
        }
        {
          status === DownloadFileStatus.Downloading &&
          <>
            <DiskButton color={'inherit'} id="disk-button-download" style={{ marginRight: 20 }} text={t('disk.downloading')} />
            <DiskButton color={'inherit'} id="disk-button-delete" text={t('disk.delete')} />
          </>
        }
        {
          status === DownloadFileStatus.Cached &&
          <>
            <DiskButton color={'inherit'} id="disk-button-download" style={{ marginRight: 20 }} text={t('disk.downloaded')} />
            <DiskButton color={'secondary'} onClick={() => handleDeleteSingle(row.resourceUuid)} id="disk-button-delete" text={t('disk.delete')} />
          </>
        }
      </DiskTableCell>
    </TableRow>
  )
})