import React from 'react';
import { IconButton, InputAdornment, Table, TableBody, TableRow, TextField} from "@material-ui/core";
import { EnhancedTableHead } from "../control/enhanced-table-head";
import { DiskTableCell } from "../dialog/table-cell";
import { DiskCheckbox } from "../control/checkbox";
// disk table styles,  checkbox select function
import { DiskTablesProps, useDiskTableStyles, useSearchStyles, getComparator, stableSort, createData, Order } from "./private-disk-table";
import CancelIcon from "@material-ui/icons/Cancel";
import SearchIcon from "@material-ui/icons/Search";
import TableEmpty from "../dialog/table-empty";

interface PublicDiskTablesProps extends DiskTablesProps {
  publicList?: any,
}

const PublicDiskTables = (props: PublicDiskTablesProps) => {
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
    console.log('>>>>>setSearchContent(``), clear all input')
    setSearchContent('')
  }

  const DiskSearch = (props: any) => {
    return (
      <div className={classSearch.titleBox}>
        <div className={classSearch.titleButton}>
        </div>
        <div>
          <TextField
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

  // const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   if (event.target.checked) {
  //     const newSelecteds = rows.map((n: any) => n.name);
  //     setSelected(newSelecteds);
  //     return;
  //   }
  //   setSelected([]);
  // };


  const DiskTable = (props: DiskTablesProps) => {
    return (
      <Table
        className={classes.table}
        aria-labelledby="tableTitle"
        size={'medium'}
        aria-label="enhanced table"
      >
        {/* <EnhancedTableHead
          numSelected={selected.length}
          // order={order}
          // orderBy={orderBy}
          onSelectAllClick={handleSelectAllClick}
          // onRequestSort={handleRequestSort}
          rowCount={rows.length}
        /> */}
        <TableBody>
          {stableSort(rows, getComparator(order, orderBy))
            // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row: any, index: number) => {
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
                  <DiskTableCell style={{ color: '#586376' }} align="right">{row.calories}</DiskTableCell>
                  <DiskTableCell style={{ color: '#586376' }} align="right">{row.fat}</DiskTableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    )
  }

  console.log('>>>>>>>>rows', typeof rows, rows)

  const render = () => {
    return (
      <>
        <div className={classSearch.titleBox}>
          <div className={classSearch.titleButton}></div>
          <div>
            <TextField
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
        { rows && <DiskTable tabValue={props.tabValue}/> || <TableEmpty /> }
      </>
    );
  };
  return render();
};
export default PublicDiskTables