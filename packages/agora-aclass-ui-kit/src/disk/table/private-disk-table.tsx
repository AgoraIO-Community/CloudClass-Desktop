import React from 'react';
import { IconButton, Table, TableBody, TableRow, InputAdornment, Theme, TextField } from "@material-ui/core";
import { makeStyles, createStyles, withStyles } from '@material-ui/core/styles'
import SearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';
import { DiskCheckbox } from "../control/checkbox";
import { DiskTableCellHead, DiskTableCell } from "../dialog/table-cell";
import { EnhancedTableHead } from "../control/enhanced-table-head";
import DiskToast from '../control/toast'
import TableEmpty from "../dialog/table-empty";
import { DiskButton } from "../control/disk-button";

import IconRefresh from '../assets/icon-refresh.png'

export interface Data {
  calories: any;
  fat: number;
  name: string;
}

export const createData = function (name: string, calories: any, fat: number): Data {
  return { name, calories, fat, };
}

// mock data
export const rows: any[] = [
  createData('Cupcake', '1.3 M', 3.7),
  createData('Donut', '1.4 M', 25.0),
  createData('Eclair', '2.7 M', 16.0),
  createData('Frozen yoghurt', '159 M', 6.0),
  createData('Gingerbread', '356 M', 16.0),
  createData('Honeycomb', '408 M', 3.2),
];

export const descendingComparator = function(a: any, b: any, orderBy: any) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export type Order = 'asc' | 'desc';

export const getComparator = function(order: Order, orderBy: any) {
  return order === 'desc'
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy);
}

export const stableSort = function(array: any[], comparator: (a: any, b: any) => number) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export const useDiskTableStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      height: '480px',
      width: '730px',
      borderRadius: '20px',
      padding: '20px'
    },
    table: {
      maxHeight: 510,
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
    downloadLabel: {
      color: '#273D75',
      marginRight: '12px',
    },
    downloadText: {
      color: '#5471FE',
    },
  }),
);

export const useSearchStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      width: '200px',
      height: '34px',
      border: 'none',
    },
    titleBox: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '20px'
    },
    titleButton: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    titleImg: {
      marginLeft: '20px',
      '&:hover': {
        opacity: 0.6,
        cursor: 'pointer',
      }
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
      borderRadius: '6px',
      borderColor: '#E3E3EC',
      "&:focus": {
        borderColor: '#5471FE',
      },
      "&:hover": {
        borderColor: '#7C91F8',
      },
    },
    iconButton: {
      padding: '2px',
    },
  }),
);

export interface DiskTablesProps {
  tabValue: number,
}
interface PrivateDiskTablesProps extends DiskTablesProps {
  privateList?: any,
}

const PrivateDiskTables = (props: PrivateDiskTablesProps) => {
  const classes = useDiskTableStyles()
  const [order, setOrder] = React.useState<Order>('asc')
  const [orderBy, setOrderBy] = React.useState<any>('calories')
  const [selected, setSelected] = React.useState<string[]>([])
  const [openToast, setOpenToast] = React.useState({
    open: false,
    toastMessage: '',
    type: '',
  })

  const rows = props.privateList

  const { open, toastMessage, type } = openToast

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n: any) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  // const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const classSearch = useSearchStyles()

  const [searchContent, setSearchContent] = React.useState('')
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handle change input', event.target.value)
    setSearchContent(event.target.value)
  }

  const handleClearInput = () => {
    console.log('>>>>>setSearchContent(``), clear all input')
    setSearchContent('')
  }

  const handleRefresh = () => {
    console.log('>>>>>refresh')
  }

  const handleUpload = () => {
    console.log('>>>>>upload')
    setOpenToast({
      open: true,
      toastMessage: '文件上传成功！',
      type: 'success',
    })
  }

  const handleDelete = () => {
    console.log('>>>>delete')
    setOpenToast({
      open: true,
      toastMessage: '删除文件失败！',
      type: 'error',
    })
  }

  const DiskSearch = (props: any) => {
    return (
      <div className={classSearch.titleBox}>
        <div className={classSearch.titleButton}>
          <DiskButton id="disk-button-upload" onClick={handleUpload} color={'primary'} text={'上传'} />
          <DiskButton id="disk-button-delete" style={{ marginLeft: '20px', }} onClick={handleDelete} color={'secondary'} text={'删除'} />
          <img id="disk-button-refresh" onClick={handleRefresh} src={IconRefresh} className={classSearch.titleImg} />
        </div>
        <div>
          <TextField
            id="disk-input-search"
            className={classSearch.input}
            onChange={handleChange}
            placeholder={'搜索'}
            variant='outlined'
            value={searchContent}
            InputProps={{
              classes: {
                root: classSearch.root,
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearInput} className={classSearch.iconButton}>
                    <CancelIcon />
                  </IconButton>
                  <IconButton type="submit" className={classSearch.iconButton} aria-label="search">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            size="small" />
        </div>
      </div>
    )
  }

  const handleCloseAlert = () => {
    setOpenToast({
      open: false,
      toastMessage: '',
      type: '',
    })
  }

  const DiskTable = (props: DiskTablesProps) => {
    return (
      <Table
        className={classes.table}
        aria-labelledby="tableTitle"
        size={'medium'}
        aria-label="enhanced table"
      >
        <EnhancedTableHead
          numSelected={selected.length}
          // order={order}
          // orderBy={orderBy}
          onSelectAllClick={handleSelectAllClick}
          // onRequestSort={handleRequestSort}
          rowCount={rows.length}
        />
        <TableBody>
          {stableSort(rows, getComparator(order, orderBy))
            // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row: any, index: number) => {
              const isItemSelected = isSelected(row.name);
              const labelId = `private-table-checkbox-${index}`;

              return (
                <TableRow
                  onClick={(event) => handleClick(event, row.name)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.name}
                >
                  <DiskTableCell padding="checkbox">
                    <DiskCheckbox
                      checked={isItemSelected}
                      inputProps={{ 'aria-labelledby': labelId }}
                    />
                  </DiskTableCell>
                  <DiskTableCell component="th" id={labelId} scope="row" padding="none">
                    {row.name}
                  </DiskTableCell>
                  <DiskTableCell align="right">{row.calories}</DiskTableCell>
                  <DiskTableCell align="right">{row.fat}</DiskTableCell>
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
        <DiskToast
          onOpenToast={open}
          onClose={handleCloseAlert}
          message={toastMessage}
          //@ts-ignore
          toastType={type}
          key={'top-center'}
        />
        <div className={classSearch.titleBox}>
          <div className={classSearch.titleButton}>
            <DiskButton id="disk-button-upload" onClick={handleUpload} color={'primary'} text={'上传'} />
            <DiskButton id="disk-button-delete" style={{ marginLeft: '20px', }} onClick={handleDelete} color={'secondary'} text={'删除'} />
            <img id="disk-button-refresh" onClick={handleRefresh} src={IconRefresh} className={classSearch.titleImg} />
          </div>
          <div>
            <TextField
              id="disk-input-search"
              className={classSearch.input}
              onChange={handleChange}
              placeholder={'搜索'}
              variant='outlined'
              value={searchContent}
              InputProps={{
                classes: {
                  root: classSearch.root,
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearInput} className={classSearch.iconButton}>
                      <CancelIcon />
                    </IconButton>
                    <IconButton type="submit" className={classSearch.iconButton} aria-label="search">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              size="small" />
          </div>
        </div>
        { rows && <DiskTable tabValue={props.tabValue} /> || <TableEmpty /> }
      </>
    )
  }
  return render()
}

export default PrivateDiskTables
