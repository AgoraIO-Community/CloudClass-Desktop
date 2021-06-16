import React from 'react';
import { IconButton, InputAdornment, Table, TableBody, TableRow, TextField} from "@material-ui/core";
import { EnhancedTableHead } from "../control/enhanced-table-head";
import { DiskTableCell } from "../dialog/table-cell";
import { DiskCheckbox } from "../control/checkbox";
import { DiskButton } from "../control/disk-button";
// disk table styles,  checkbox select function
import { DiskTablesProps, useDiskTableStyles, useSearchStyles, getComparator, stableSort, createData, Order } from "./private-disk-table";
import CancelIcon from "@material-ui/icons/Cancel";
import SearchIcon from "@material-ui/icons/Search";
import TableEmpty from "../dialog/table-empty";
import dayjs from 'dayjs';
import { CourseIconMapper } from '../dialog/courseIcon'

interface PublicDiskTablesProps extends DiskTablesProps {
  publicList?: any,
  diskText?: any,
  showOpenItem?: boolean,
  handleOpenCourse?: (evt: any) => any,
}

const PublicDiskTables = (props: PublicDiskTablesProps) => {
  const showText = props.showText
  const classes = useDiskTableStyles()
  const classSearch = useSearchStyles()

  const [selected, setSelected] = React.useState<string[]>([])

  // set table row data
  const [order, setOrder] = React.useState<Order>('asc')
  const [orderBy, setOrderBy] = React.useState<any>('calories')
  const [rowsPerPage, setRowsPerPage] = React.useState(5)
  const [page, setPage] = React.useState(0)
  const [searchContent, setSearchContent] = React.useState('')

  const rows = props.publicList

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handle change input', event.target.value)
    setSearchContent(event.target.value)
  }

  const handleClearInput = () => {
    setSearchContent('')
  }

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

  // const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.checked) {
  //     const newSelecteds = rows.map((n: any) => n.id);
  //     setSelected(newSelecteds);
  //     return;
  //   }
  //   setSelected([]);
  // };

  const handleOpenCourse = async (resourcUuid: any) => {
    try {
      props.handleOpenCourse &&  await props.handleOpenCourse(resourcUuid)
    } catch (err) {
      console.log('打开课件错误')
    }
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
          showCheckbox={false}
          diskText={props.diskText}
          numSelected={selected.length}
          // order={order}
          // orderBy={orderBy}
          // onSelectAllClick={handleSelectAllClick}
          // onRequestSort={handleRequestSort}
          rowCount={rows.length}
        />
        <TableBody component="div">
          {stableSort(rows, getComparator(order, orderBy))
            // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row: any, index: number) => {
              const isItemSelected = isSelected(row.id);
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow
                  component="div"
                  onClick={(event: any) => handleClick(event, row.id)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.id}
                >
                  {/* <DiskTableCell padding="checkbox">
                    <DiskCheckbox
                      checked={isItemSelected}
                      inputProps={{ 'aria-labelledby': labelId }}
                    />
                  </DiskTableCell> */}
                  <DiskTableCell component="div" style={{ paddingLeft: 15 }} id={labelId} padding="none">
                    <div style={{ display: 'flex', overflow: 'hidden', textOverflow: 'ellipse', maxWidth: 150, whiteSpace: 'nowrap' }}>
                      <img src={CourseIconMapper[row.type]} style={{ width: 22.4, height: 22.4 }} />
                      <div style={{ marginLeft: 5, textOverflow: 'ellipsis', overflow: 'hidden' }}>{row.name}</div>
                    </div>
                  </DiskTableCell>
                  <DiskTableCell component="div" style={{ color: '#586376' }} align="right">{row.calories}</DiskTableCell>
                  <DiskTableCell component="div" style={{ color: '#586376' }} align="right">{dayjs(row.fat).format("YYYY-MM-DD HH:mm:ss")}</DiskTableCell>
                  {
                    props.showOpenItem ? 
                    <DiskTableCell component="div"  align="right">
                      <span style={{color: '#586376',cursor: 'pointer'}} onClick={() => {
                        handleOpenCourse(row.id)
                      }}>
                        {showText}
                      </span>
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

  const render = () => {
    return (
      <>
        {/* <div className={classSearch.titleBox}>
          <div className={classSearch.titleButton}></div>
          <div>
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
          </div>
        </div> */}
        { rows && rows.length > 0 && <DiskTable tabValue={props.tabValue} diskText={props.diskText} showOpenItem={props.showOpenItem} handleOpenCourse={props.handleOpenCourse} /> 
        || 
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
    );
  };
  return render();
};
export default PublicDiskTables