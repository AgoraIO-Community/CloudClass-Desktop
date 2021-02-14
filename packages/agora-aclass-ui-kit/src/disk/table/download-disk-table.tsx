import React from 'react';
import { Table, TableBody, TableHead, TableRow } from "@material-ui/core";
import { DiskTablesProps, useDiskTableStyles, createData } from "./private-disk-table";

import { DiskTableCell, DiskTableCellHead, DownloadTableCell } from "../dialog/table-cell";
import { DiskButton } from "../control/disk-button";
import { DiskAllProgress, DiskSingleProgress } from "../control/progress";
import TableEmpty from "../dialog/table-empty";

const rows: any[] = [
  {name: 'Gabumon', calories: 10, fat: 123},
  {name: 'sora', calories: 20, fat: 123},
  {name: 'sokaa', calories: 30, fat: 123},
  {name: 'kiyomi', calories: 40, fat: 123},
  {name: 'Agumon', calories: 50, fat: 123},
  {name: '22', calories: 60, fat: 123},
  {name: '33', calories: 70, fat: 123},
  {name: '太一', calories: 80, fat: 123},
  {name: '哆啦A梦', calories: 90, fat: 123},
  {name: '大和', calories: 100, fat: 123},
];

const DownloadDiskTables = (props: DiskTablesProps) => {

  const DownloadTableHead = (props: any) => {
    return (
      <TableHead>
        <TableRow style={{ color: '#273D75' }}>
          <DiskTableCellHead style={{ paddingLeft: 15 }} id="name" key="name" scope="row">文件</DiskTableCellHead>
          <DiskTableCellHead id="calories" key="calories" align="left">进度</DiskTableCellHead>
          <DiskTableCellHead style={{ paddingRight: 120 }} id="fat" key="fat" align="center">操作</DiskTableCellHead>
        </TableRow>
      </TableHead>
    )
  }

  const classes = useDiskTableStyles()

  const DiskTable = (props: DiskTablesProps) => {
    return (
      <Table
        className={classes.table}
        aria-labelledby="tableTitle"
        size={'medium'}
        aria-label="enhanced table"
      >
        <DownloadTableHead />
        <TableHead>
          <TableRow style={{ color: '#273D75' }}>
            <DownloadTableCell style={{ paddingLeft: 15 }} id="name" key="name" scope="row">
              <span className={classes.downloadLabel}>全部: <span className={classes.downloadText}>48</span></span>
              &nbsp;
              <span className={classes.downloadLabel}>已下载: <span className={classes.downloadText}>1</span></span>
              &nbsp;
              <span className={classes.downloadLabel}>未下载: <span className={classes.downloadText}>47</span></span>
            </DownloadTableCell>
            <DownloadTableCell align="left">
              <DiskAllProgress value={50} />
            </DownloadTableCell>
            <DownloadTableCell align="right">
              <DiskButton id="disk-button-donwload-all" style={{ marginRight: 20 }} color={'primary'} text={'全部下载'} />
              <DiskButton id="disk-button-clear-storage" color={'secondary'} text={'清空缓存'} />
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
                    {row.name}
                  </DiskTableCell>
                  <DiskTableCell style={{ color: '#586376' }} align="left">
                    {/* {row.calories} */}
                    {/* 下载进度 */}
                    <DiskSingleProgress value={row.calories} />
                  </DiskTableCell>
                  <DiskTableCell style={{ color: '#586376' }} align="right">
                    <DiskButton id="disk-button-download" style={{ marginRight: 20 }} text={'下载'} color={'primary'} />
                    <DiskButton id="disk-button-delete" text={'删除'} color={'secondary'} />
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
        { rows.length && <DiskTable tabValue={props.tabValue}/> ||
            <div style={{ paddingTop: 54 }}>
              <TableEmpty />
            </div>}
      </>
    )
  }
  return render()
}
export default DownloadDiskTables;