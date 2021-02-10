import React from 'react';
import { IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, CheckboxProps, InputAdornment, makeStyles, createStyles, withStyles, Theme, TextField } from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';
import CancelIcon from '@material-ui/icons/Cancel';
import { UploadButton, DeleteButton } from '../index.stories'
import DiskToast from '../control/toast'
import IconRefresh from '../assets/icon-refresh.png'

interface Data {
  calories: string;
  fat: number;
  name: string;
}

const createData = function (name: string, calories: string, fat: number): Data {
  return { name, calories, fat, };
}

const rows = [
  createData('Cupcake', '1.3 M', 3.7),
  createData('Donut', '1.4 M', 25.0),
  createData('Eclair', '2.7 M', 16.0),
  createData('Frozen yoghurt', '159 M', 6.0),
  createData('Gingerbread', '356 M', 16.0),
  createData('Honeycomb', '408 M', 3.2),
];

function descendingComparator(a: any, b: any, orderBy: any) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

const getComparator = function(order: Order, orderBy: any) {
  return order === 'desc'
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy);
}

const stableSort = function(array: [], comparator: (a: any, b: any) => number) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// check box styles
const DiskCheckbox = withStyles({
  root: {
    color: '#B4BADA',
  },
  checked: {
    color: '#5471FE',
  },
  indeterminate: {
    color: '#5471FE',
  },
})((props: CheckboxProps) => <Checkbox color="default" {...props} />);

const DiskTableCellHead = withStyles(() =>
  createStyles({
    head: {
      backgroundColor: '#F8F8FB',
      color: '#273D75',
    },
    body: {
      color: '#273D75',
    },
  }),
)(TableCell);

const DiskTableCell = withStyles(() =>
  createStyles({
    head: {
      color: '#fff',
    },
    body: {
      color: '#273D75',
    }
  }),
)(TableCell);

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: any) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

const EnhancedTableHead = (props: EnhancedTableProps) => {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property: any) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow style={{ color: '#273D75' }}>
        <DiskTableCellHead padding="checkbox">
          <DiskCheckbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </DiskTableCellHead>
        <DiskTableCellHead style={{ paddingLeft: 0 }} id="name" key="name" scope="row">文件名</DiskTableCellHead>
        <DiskTableCellHead id="calories" key="calories" align="right">大小</DiskTableCellHead>
        <DiskTableCellHead id="fat" key="fat" align="right">修改时间</DiskTableCellHead>
      </TableRow>
    </TableHead>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center',
      width: '100%',
    },
    paper: {
      width: '770px',
      borderRadius: '10px',
      marginBottom: theme.spacing(2),
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
    secondButton: {
      marginLeft: '20px',
    },
    titleImg: {
      marginLeft: '20px',
      '&:hover': {
        opacity: 0.6,
        cursor: 'pointer',
      }
    },
    titleSearch: {

    },
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
  }),
);

const useInputStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      width: '200px',
      height: '34px',
      border: 'none',
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

export default function DiskTables() {
  const classes = useStyles()
  const [order, setOrder] = React.useState<Order>('asc')
  const [orderBy, setOrderBy] = React.useState<any>('calories')
  const [selected, setSelected] = React.useState<string[]>([])
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)
  const [openToast, setOpenToast] = React.useState({
    open: false,
    toastMessage: '',
    type: '',
  })

  const { open, toastMessage, type } = openToast


  const handleRequestSort = (event: React.MouseEvent<unknown>, property: any) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
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

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const classInput = useInputStyles()

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

  const DiskSearch = () => {
    return (
      <div className={classes.titleBox}>
        <div className={classes.titleButton}>
          <UploadButton onClick={handleUpload} color={'primary'} text={'上传'} />
          <DeleteButton onClick={handleDelete} color={'secondary'} text={'删除'} />
          <img onClick={handleRefresh} src={IconRefresh} className={classes.titleImg} />
        </div>
        <div className={classes.titleSearch}>
          <TextField
            className={classInput.input}
            onChange={handleChange}
            placeholder={'搜索'}
            variant='outlined'
            value={searchContent}
            InputProps={{
              classes: {
                root: classInput.root,
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearInput} className={classInput.iconButton}>
                    <CancelIcon />
                  </IconButton>
                  <IconButton type="submit" className={classInput.iconButton} aria-label="search">
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

  const DiskTable = () => {
    return (
      <Table
        className={classes.table}
        aria-labelledby="tableTitle"
        size={'medium'}
        aria-label="enhanced table"
      >
        <EnhancedTableHead
          classes={classes}
          numSelected={selected.length}
          order={order}
          orderBy={orderBy}
          onSelectAllClick={handleSelectAllClick}
          onRequestSort={handleRequestSort}
          rowCount={rows.length}
        />
        <TableBody>
          {stableSort(rows, getComparator(order, orderBy))
            // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, index) => {
              const isItemSelected = isSelected(row.name);
              const labelId = `enhanced-table-checkbox-${index}`;

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
          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
      </Table>
    )
  }

  const render = () => {
    return (
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <TableContainer className={classes.container}>
            <DiskToast
              onOpenToast={open}
              onClose={handleCloseAlert}
              message={toastMessage}
              toastType={type}
              key={'top-center'}
            />
            { DiskSearch() }
            { DiskTable() }
          </TableContainer>
        </Paper>
      </div>
    )
  }
  return render()
}
