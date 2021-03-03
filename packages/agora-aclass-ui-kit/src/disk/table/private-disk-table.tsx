import React, { useCallback } from 'react';
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

import IconPpt from '../assets/icon-ppt.png'
import IconWord from '../assets/icon-word.png'
import IconExcel from '../assets/icon-excel.png'
import IconPdf from '../assets/icon-pdf.png'
import IconVideo from '../assets/icon-video.png'
import IconAudio from '../assets/icon-audio.png'
import IconTxt from '../assets/icon-txt.png'
import IconPicture from '../assets/icon-pic.png'
import dayjs from 'dayjs';
import { useEffect } from 'react';

export interface Data {
  calories: any;
  fat: number;
  name: string;
  type?: any;
}

export const createData = function (name: string, calories: any, fat: number, type?: any): Data {
  return { name, calories, fat, type,};
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
      flexDirection: 'column',
      height: '480px',
      width: '730px',
      borderRadius: '20px',
      padding: '20px',
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
      paddingBottom: '20px',
      flexDirection: 'column',
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
  diskText?: any,
  showOpenItem?: boolean,
  handleOpenCourse?: (evt: any) => any,
  showText?: string
}
interface PrivateDiskTablesProps extends DiskTablesProps {
  privateList?: any,
  uploadComponent?: React.ReactNode,
  uploadListComponent?: React.ReactNode,  
  isOpenToast:boolean,
  toastMessage?: {
    type: string,
    message:string
  },
  diskText?: any,
  // deleteText: string,
  // deleteComponent?: React.ReactNode,
  removeText: string,
  handleDelete: (evt: any) => any,
  removeSuccess: string,
  removeFailed: string,
  refreshComponent?: React.ReactNode,
  showOpenItem?: boolean,
  handleOpenCourse?: (evt: any) => any,
}

export const iconMapper = {
  ppt: IconPpt,
  word: IconWord,
  excel: IconExcel,
  pdf: IconPdf,
  video: IconVideo,
  audio: IconAudio,
  txt: IconTxt,
  pic: IconPicture,
}

const PrivateDiskTables = (props: PrivateDiskTablesProps) => {

  const showText = props.showText
  // const deleteText = props.deleteText
  const classes = useDiskTableStyles()
  const [order, setOrder] = React.useState<Order>('asc')
  const [orderBy, setOrderBy] = React.useState<any>('calories')
  const [selected, setSelected] = React.useState<string[]>([])
  const [isOpenToast, setIsOpenToast] = React.useState(props.isOpenToast)
  const [openToast, setOpenToast] = React.useState({
    open: false,
    toastMessage: '',
    type: '',
  })

  const rows = props.privateList

  const { open, toastMessage, type } = openToast

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n: any) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
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

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

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
  }

  const handleDelete = useCallback(async (evt: any) => {
    await props.handleDelete(selected)
  }, [selected])

  const handleOpenCourse = async (resourceUuid: any) => {
    try {
      props.handleOpenCourse &&  await props.handleOpenCourse(resourceUuid)
    } catch (err) {
      console.log('打开课件错误')
    }
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
        component="div"
        className={classes.table}
        aria-labelledby="tableTitle"
        size={'medium'}
        aria-label="enhanced table"
      >
        <EnhancedTableHead
          showCheckbox={true}
          diskText={props.diskText}
          numSelected={selected.length}
          // order={order}
          // orderBy={orderBy}
          onSelectAllClick={handleSelectAllClick}
          // onRequestSort={handleRequestSort}
          rowCount={rows.length}
        />
        <TableBody component="div">
          {stableSort(rows, getComparator(order, orderBy))
            // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row: any, index: number) => {
              const isItemSelected = isSelected(row.id);
              const labelId = `private-table-checkbox-${index}`;

              return (
                <TableRow
                  component="div"
                  onClick={(event: any) => handleClick(event, row.id)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.id}
                >
                  <DiskTableCell component="div" padding="checkbox">
                    <DiskCheckbox
                      checked={isItemSelected}
                      inputProps={{ 'aria-labelledby': labelId }}
                    />
                  </DiskTableCell>
                  <DiskTableCell component="div" id={labelId} scope="row" padding="none">
                    <div style={{ display: 'flex' }}>
                      <img src={iconMapper[row.type]} style={{ width: 22.4, height: 22.4 }} />
                      <div style={{ marginLeft: 5 }}>{row.name}</div>
                    </div>
                  </DiskTableCell>
                  <DiskTableCell component="div" align="right">{row.calories}</DiskTableCell>
                  <DiskTableCell component="div" align="right">{dayjs(row.fat).format("YYYY-MM-DD HH:mm:ss")}</DiskTableCell>
                  {
                    props.showOpenItem ? 
                    <DiskTableCell component="div" align="right">
                      <span style={{cursor: 'pointer'}} onClick={() => {
                        handleOpenCourse(row.id)
                      }}>
                        {showText}
                      </span>
{/* 
                      <span style={{cursor: 'pointer'}} onClick={() => {
                        handleOpenCourse(row.id, 'delete')
                      }}>
                        {deleteText}
                      </span> */}
                    </DiskTableCell>
                    : null
                  }
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    )
  }
  useEffect(() => {
    console.log('isOpenToast disk,props.isOpenToast is:', props.isOpenToast)
    setIsOpenToast(props.isOpenToast)
  }, [props.isOpenToast])
  const render = () => {
    return (
      <>
        <DiskToast
          onOpenToast={isOpenToast}
          onClose={handleCloseAlert}
          message={props.toastMessage?.message|| ''}
          //@ts-ignore
          toastType={props.toastMessage?.type ||''}
          key={'top-center'}
        />
        <div className={classSearch.titleBox}>
          <div className={classSearch.titleButton}>
            {props.uploadComponent}
            <DiskButton disabled={selected.length === 0} id="disk-button-delete" style={{ marginLeft: '20px', }} onClick={handleDelete} color={'secondary'} text={props.removeText} />
            { props.refreshComponent }
          </div>
          {/* <div>
            <TextField
              id="disk-input-search"
              className={classSearch.input}
              onChange={handleChange}
              placeholder={props.diskText.search}
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
          </div> */}
        </div>
        {props.uploadListComponent}
        { rows && rows.length > 0 && <DiskTable tabValue={props.tabValue} diskText={props.diskText} showOpenItem={props.showOpenItem} handleOpenCourse={props.handleOpenCourse} /> || 
          <div
            style={{ 
              height: '480px',
              width: '730px',
              borderRadius: '20px',
              paddingTop: '54px',
            }}
          >
            <TableEmpty diskText={props.diskText} /> 
          </div>
        }
      </>
    )
  }
  return render()
}

export default PrivateDiskTables
