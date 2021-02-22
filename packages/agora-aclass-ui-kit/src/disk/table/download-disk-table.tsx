import React, { Dispatch, SetStateAction } from 'react';
import { Table, TableBody, TableHead, TableRow } from "@material-ui/core";
import { iconMapper, DiskTablesProps, useDiskTableStyles, createData } from "./private-disk-table";

import { DiskTableCell, DiskTableCellHead, DownloadTableCell } from "../dialog/table-cell";
import { DiskButton } from "../control/disk-button";
import { DiskAllProgress, DiskSingleProgress } from "../control/progress";
import TableEmpty from "../dialog/table-empty";
import { cloneDeep } from "lodash" 
interface DownloadDiskTablesProps extends DiskTablesProps {
  diskText?: any,
  downloadList?: any,
  donwloadAllComponent?: React.ReactNode,
  deleteAllCacheComponent?: React.ReactNode,
  singleDownloadComponent?: React.ReactNode,
  singleDeleteComponent?: React.ReactNode,
  handleDownloadAll?: () => any,
  handleClearcache?: () => Promise<void>,
  handleDownload?: (evt: any) => any,
  handleDeleteSingle?: (evt: any) => any,
  setDownloadList?: Dispatch<SetStateAction<any>>,
}

const DownloadDiskTables = (props: DownloadDiskTablesProps) => {
  const classes = useDiskTableStyles()

  const rows = props.downloadList

  const notDownload = 3

  const handleDownloadAll = async () => {
    props.handleDownloadAll && await props.handleDownloadAll()
  }

  const handleClearcache = async () => {
    props.handleClearcache && await props.handleClearcache()
  }

  const checkProgress = (index: number) => {
    setTimeout(() => {
      if (rows[index].status === 'downloading') {
        props.setDownloadList && props.setDownloadList(cloneDeep(rows))
        checkProgress(index)
      }
    }, 1000)
  }

  const handleDownload = (evt: any, index: number) => {
    if (props.handleDownload) {
      rows[index].status = 'downloading'
      props.setDownloadList && props.setDownloadList(cloneDeep(rows))
      checkProgress(index)
      props.handleDownload(evt).then(() => {
        rows[index].status = 'cached'
        rows[index].progress = 100
        props.setDownloadList && props.setDownloadList(cloneDeep(rows))
      })
    }
  }

  const handleDeleteSingle = async (evt: any, index: number) => {
    // props.handleDeleteSingle && await props.handleDeleteSingle(evt)
    if (props.handleDeleteSingle) {
      props.handleDeleteSingle(evt).then(() => {
        rows[index].status = 'notCache'
        rows[index].progress = 0
        props.setDownloadList && props.setDownloadList(cloneDeep(rows))
      })
    }
  }

  const DownloadTableRow = (props: any) => {
    let row = props.data
    let index = props.index
    return (
      <TableRow
        component="div"
        // onClick={(event) => handleClick(event, row.id)}
        role="checkbox"
        // aria-checked={isItemSelected}
        tabIndex={-1}
        key={row.id}
      >
        <DiskTableCell component="div" style={{ paddingLeft: 15 }} id={index} scope="row" padding="none">
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
        <DiskTableCell component="div" style={{ color: '#586376' }} align="left">
          {/* {row.calories} */}
          {/* 下载进度 */}
          <DiskSingleProgress value={row.progress} />
        </DiskTableCell>
        <DiskTableCell component="div" style={{ color: '#586376' }} align="right">
          {/* { props.singleDownloadComponent }
          { props.singleDeleteComponent } */}
          {
            row.status === 'notCache' && 
            <>
              <DiskButton color={'primary'} onClick={() => handleDownload(row.resourceUuid, index)} id="disk-button-download" style={{ marginRight: 20 }} text={props.diskText.download} />
              <DiskButton color={'inherit'} id="disk-button-delete" text={props.diskText.delete} />
            </>
          }
          {
            row.status === 'downloading' &&
            <>
              <DiskButton color={'inherit'} id="disk-button-download" style={{ marginRight: 20 }} text={props.diskText.downloading} />
              <DiskButton color={'inherit'} id="disk-button-delete" text={props.diskText.delete} />
            </>
          }
          {
            row.status === 'cached' &&
            <>
              <DiskButton color={'inherit'} id="disk-button-download" style={{ marginRight: 20 }} text={props.diskText.downloaded} />
              <DiskButton color={'secondary'} onClick={() => handleDeleteSingle(row.resourceUuid, index)} id="disk-button-delete" text={props.diskText.delete} />
            </>
          }
        </DiskTableCell>
      </TableRow>
    )
  }

  const DiskTable = (props: DownloadDiskTablesProps) => {


    return (
      <Table
        component="div"
        className={classes.table}
        aria-labelledby="tableTitle"
        size={'medium'}
        aria-label="enhanced table"
      >
        <TableHead component="div">
          <TableRow component="div" style={{ color: '#273D75' }}>
            <DiskTableCellHead component="div" style={{ paddingLeft: 15 }} id="name" key="name" scope="row">{props.diskText.file}</DiskTableCellHead>
            <DiskTableCellHead component="div" id="calories" key="calories" align="left">{props.diskText.progress}</DiskTableCellHead>
            <DiskTableCellHead component="div" style={{ paddingRight: 120 }} id="fat" key="fat" align="center">{props.diskText.operation}</DiskTableCellHead>
          </TableRow>
        </TableHead>
        <TableHead component="div">
          <TableRow component="div" style={{ color: '#273D75' }}>
            <DownloadTableCell component="div" style={{ paddingLeft: 15 }} id="name" key="name" scope="row">
              <span className={classes.downloadLabel}>{props.diskText.all}: <span className={classes.downloadText}>{rows ? rows.length : 0}</span></span>
              &nbsp;
              <span className={classes.downloadLabel}>{props.diskText.downloaded}: <span className={classes.downloadText}>1</span></span>
              &nbsp;
              <span className={classes.downloadLabel}>{props.diskText.notDownload}: <span className={classes.downloadText}>47</span></span>
            </DownloadTableCell>
            <DownloadTableCell component="div" align="left">
              <DiskAllProgress value={notDownload / rows.length * 100} />
            </DownloadTableCell>
            <DownloadTableCell component="div" align="right">
              {/* { props.donwloadAllComponent }
              { props.deleteAllCacheComponent } */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <DiskButton onClick={handleDownloadAll} id="disk-button-donwload-all" style={{ marginRight: 20 }} color={'primary'} text={props.diskText.downloadAll} />
                <DiskButton onClick={handleClearcache} id="disk-button-clear-storage" color={'secondary'} text={props.diskText.clearCache} />
              </div>
            </DownloadTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            rows.map((row: any, index: number) => {
              // const isItemSelected = isSelected(row.id);
              // const labelId = `download-disk-${index}`;

              return (
                <DownloadTableRow data={row} index={index} diskText={props.diskText} />
              );
            })}
        </TableBody>
      </Table>
    )
  }

  const render = () => {
    return (
      <>
        { rows && rows.length > 0 && <DiskTable setDownloadList={props.setDownloadList} tabValue={props.tabValue} diskText={props.diskText} /> ||
            <div style={{ 
              paddingTop: 54,
              height: '480px',
              width: '730px',
              borderRadius: '20px',
              }}>
              <TableEmpty diskText={props.diskText} />
            </div>}
      </>
    )
  }
  return render()
}
export default DownloadDiskTables;