import React from 'react';
import { Table, TableBody, TableHead, TableRow } from '@material-ui/core';
import { useDiskTableStyles, DiskTableCellHead, DownloadTableCell, DiskButton, DiskAllProgress, DiskSingleProgress } from 'agora-aclass-ui-kit'
import {t} from '../../i18n'
import { DownloadDiskTablesProps } from './index'
import { diskAppStore } from '../../monolithic/disk/disk-store';
import DownloadTableRow from './disk-table-row'


const DiskTable = (props: DownloadDiskTablesProps) => {
  const classes = useDiskTableStyles()

  let rows = props.downloadList

  const notDownload = 3

  const handleDownloadAll = async () => {
    props.handleDownloadAll && await props.handleDownloadAll(rows)
  }

  const handleClearcache = async () => {
    diskAppStore.deleteAllCache()
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
            style={{ paddingLeft: 15 }} id="name" key="name" scope="row">{'文件'}</DiskTableCellHead>
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
            <span className={classes.downloadLabel}>{t('disk.downloaded')}: <span className={classes.downloadText}>1</span></span>
            &nbsp;
            <span className={classes.downloadLabel}>{t('disk.notDownload')}: <span className={classes.downloadText}>0</span></span>
          </DownloadTableCell>
          <DownloadTableCell style={{ backgroundColor: '#F0F3FF' }} align="left">
            <DiskAllProgress value={notDownload / rows.length * 100} />
          </DownloadTableCell>
          <DownloadTableCell style={{ backgroundColor: '#F0F3FF' }} align="right">
            {/* { props.donwloadAllComponent }
            { props.deleteAllCacheComponent } */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <DiskButton onClick={handleDownloadAll} id="disk-button-donwload-all" style={{ marginRight: 20 }} color={'primary'} text={t('disk.downloadAll')} />
              <DiskButton onClick={handleClearcache} id="disk-button-clear-storage" color={'secondary'} text={t('disk.clearCache')} />
            </div>
          </DownloadTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {
          rows.map((row: any, index: number) => {
            return (
              <DownloadTableRow
                key={`${row}${index}`}
                data={row}
                index={index}
                registerTaskCallback={props.registerTaskCallback}
                handleClearcache={props.handleClearcache}
                handleDownload={props.handleDownload}
                handleDeleteSingle={props.handleDeleteSingle}
              />
            );
          })}
      </TableBody>
    </Table>
  )
}

export default DiskTable