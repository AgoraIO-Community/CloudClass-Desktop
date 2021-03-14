import React from 'react';
import { Table, TableBody, TableHead, TableRow } from '@material-ui/core';
import { useDiskTableStyles, DiskTableCellHead, DownloadTableCell, DiskButton, DiskAllProgress, DiskSingleProgress } from 'agora-aclass-ui-kit'
import {t} from '../../i18n'
import { DownloadDiskTablesProps } from './index'
import { DownloadTableRow } from './disk-table-row'
import { useStorageStore } from '@/hooks';
import { observer } from 'mobx-react';

export const DiskTable = observer((props: DownloadDiskTablesProps) => {
  const classes = useDiskTableStyles()

  const storageStore = useStorageStore()

  const rows = storageStore.courseWareList

  const downloadedLength = storageStore.downloadedList.length

  const notDownloadedLength = storageStore.notDownloadedList.length

  const handleDownloadAll = async () => {
    props.handleDownloadAll && await props.handleDownloadAll(rows)
  }

  const handleClearAll = async () => {
    props.handleClearAll && await props.handleClearAll()
  }


  return (
    <Table
      className={classes.table}
      aria-labelledby="tableTitle"
      size={'medium'}
      aria-label="enhanced table"
    >
      <TableHead>
        <TableRow style={{ color: '#273D75' }}>
          <DiskTableCellHead
            style={{ paddingLeft: 15 }} id="name" key="name" scope="row">{t("disk.file")}</DiskTableCellHead>
          <DiskTableCellHead
            id="calories"
            key="calories"
            align="left"
          >{t('disk.progress')}</DiskTableCellHead>
          <DiskTableCellHead
            style={{ paddingRight: 120 }}
            id="fat"
            key="fat"
            align="center"
          >{t('disk.operation')}</DiskTableCellHead>
        </TableRow>
      </TableHead>
      <TableHead>
        <TableRow style={{ color: '#273D75' }}>
          <DownloadTableCell
            style={{ paddingLeft: 15, backgroundColor: '#F0F3FF' }}
            id="name"
            key="name"
            scope="row"
          >
            <span className={classes.downloadLabel}>{t('disk.all')}: <span className={classes.downloadText}>{rows ? rows.length : 0}</span></span>
            &nbsp;
            <span className={classes.downloadLabel}>{t('disk.downloaded')}: <span className={classes.downloadText}>{downloadedLength}</span></span>
            &nbsp;
            <span className={classes.downloadLabel}>{t('disk.notDownload')}: <span className={classes.downloadText}>{notDownloadedLength}</span></span>
          </DownloadTableCell>
          <DownloadTableCell style={{ backgroundColor: '#F0F3FF' }} align="left">
            <DiskAllProgress value={props.totalProgress!} />
          </DownloadTableCell>
          <DownloadTableCell style={{ backgroundColor: '#F0F3FF' }} align="right">
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <DiskButton onClick={handleDownloadAll} id="disk-button-download-all" style={{ marginRight: 20 }} color={'primary'} text={t('disk.downloadAll')} />
              <DiskButton onClick={handleClearAll} id="disk-button-clear-storage" color={'secondary'} text={t('disk.clearCache')} />
            </div>
          </DownloadTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          rows.map((row: any, index: number) => 
            (<DownloadTableRow
              key={`${row}${index}`}
              data={row}
              index={index}
              handleDeleteSingle={props.handleDeleteSingle}
              handleDownload={props.handleDownload}
            />)
          )
        }
      </TableBody>
    </Table>
  )
})