import React from 'react';
import { Table, TableBody, TableHead, TableRow } from "@material-ui/core";
import { iconMapper, DiskTablesProps, useDiskTableStyles, createData } from "./private-disk-table";

import { DiskTableCell, DiskTableCellHead, DownloadTableCell } from "../dialog/table-cell";
import { DiskButton } from "../control/disk-button";
import { DiskAllProgress, DiskSingleProgress } from "../control/progress";
import TableEmpty from "../dialog/table-empty";

interface DownloadDiskTablesProps extends DiskTablesProps {
  diskText?: any,
  downloadList?: any,
  donwloadAllComponent?: React.ReactNode,
  deleteAllCacheComponent?: React.ReactNode,
  singleDownloadComponent?: React.ReactNode,
  singleDeleteComponent?: React.ReactNode,
}

const DownloadDiskTables = (props: DownloadDiskTablesProps) => {
  const classes = useDiskTableStyles()

  const rows = props.downloadList

  const DiskTable = (props: DownloadDiskTablesProps) => {
    return (
      <Table
        className={classes.table}
        aria-labelledby="tableTitle"
        size={'medium'}
        aria-label="enhanced table"
      >
        <TableHead>
          <TableRow style={{ color: '#273D75' }}>
            <DiskTableCellHead style={{ paddingLeft: 15 }} id="name" key="name" scope="row">{props.diskText.file}</DiskTableCellHead>
            <DiskTableCellHead id="calories" key="calories" align="left">{props.diskText.progress}</DiskTableCellHead>
            <DiskTableCellHead style={{ paddingRight: 120 }} id="fat" key="fat" align="center">{props.diskText.operation}</DiskTableCellHead>
          </TableRow>
        </TableHead>
        <TableHead>
          <TableRow style={{ color: '#273D75' }}>
            <DownloadTableCell style={{ paddingLeft: 15 }} id="name" key="name" scope="row">
              <span className={classes.downloadLabel}>{props.diskText.all}: <span className={classes.downloadText}>{props.downloadList ? props.downloadList.length : 0}</span></span>
              &nbsp;
              <span className={classes.downloadLabel}>{props.diskText.downloaded}: <span className={classes.downloadText}>1</span></span>
              &nbsp;
              <span className={classes.downloadLabel}>{props.diskText.notDownload}: <span className={classes.downloadText}>47</span></span>
            </DownloadTableCell>
            <DownloadTableCell align="left">
              <DiskAllProgress value={50} />
            </DownloadTableCell>
            <DownloadTableCell align="right">
              { props.donwloadAllComponent }
              { props.deleteAllCacheComponent }
              {/* <DiskButton id="disk-button-donwload-all" style={{ marginRight: 20 }} color={'primary'} text={'全部下载'} /> */}
              {/* <DiskButton id="disk-button-clear-storage" color={'secondary'} text={'清空缓存'} /> */}
            </DownloadTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            rows.map((row: any, index: number) => {
              // const isItemSelected = isSelected(row.name);
              const labelId = `download-disk-${index}`;

              return (
                <TableRow
                  // onClick={(event) => handleClick(event, row.name)}
                  role="checkbox"
                  // aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.name}
                >
                  <DiskTableCell style={{ paddingLeft: 15 }} component="th" id={labelId} scope="row" padding="none">
                    <div style={{ display: 'flex' }}>
                      <img src={iconMapper[row.type]} style={{ width: 22.4, height: 22.4 }} />
                      <div style={{ marginLeft: 5 }}>{row.name}</div>
                    </div>
                  </DiskTableCell>
                  <DiskTableCell style={{ color: '#586376' }} align="left">
                    {/* {row.calories} */}
                    {/* 下载进度 */}
                    <DiskSingleProgress value={row.calories} />
                  </DiskTableCell>
                  <DiskTableCell style={{ color: '#586376' }} align="right">
                    { props.singleDownloadComponent }
                    { props.singleDeleteComponent }
                    {/* <DiskButton id="disk-button-download" style={{ marginRight: 20 }} text={'下载'} color={'primary'} />
                    <DiskButton id="disk-button-delete" text={'删除'} color={'secondary'} /> */}
                  </DiskTableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    )
  }

  const render = () => {
    return (
      <>
        { rows && <DiskTable tabValue={props.tabValue} diskText={props.diskText} /> ||
            <div style={{ paddingTop: 54 }}>
              <TableEmpty diskText={props.diskText} />
            </div>}
      </>
    )
  }
  return render()
}
export default DownloadDiskTables;