import React from 'react';
import { IconButton, InputAdornment, Table, TableBody, TableRow, TextField} from "@material-ui/core";
import { EnhancedTableHead } from "../control/enhanced-table-head";
import { DiskTableCell } from "../dialog/table-cell";
import { DiskCheckbox } from "../control/checkbox";
import { DiskButton } from "../control/disk-button";
// disk table styles,  checkbox select function
import { iconMapper, DiskTablesProps, useDiskTableStyles, useSearchStyles, getComparator, stableSort, createData, Order } from "./private-disk-table";
import CancelIcon from "@material-ui/icons/Cancel";
import SearchIcon from "@material-ui/icons/Search";
import TableEmpty from "../dialog/table-empty";

interface PublicDiskTablesProps extends DiskTablesProps {
  publicList?: any,
  diskText?: any,
  showOpenItem?: boolean,
  handleOpenCourse?: (evt: any) => any,
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
                  {/* <DiskTableCell padding="checkbox">
                    <DiskCheckbox
                      checked={isItemSelected}
                      inputProps={{ 'aria-labelledby': labelId }}
                    />
                  </DiskTableCell> */}
                  <DiskTableCell style={{ paddingLeft: 15 }} component="th" id={labelId} padding="none">
                    <div style={{ display: 'flex' }}>
                      <img src={iconMapper[row.type]} style={{ width: 22.4, height: 22.4 }} />
                      <div style={{ marginLeft: 5 }}>{row.name}</div>
                    </div>
                  </DiskTableCell>
                  <DiskTableCell style={{ color: '#586376' }} align="right">{row.calories}</DiskTableCell>
                  <DiskTableCell style={{ color: '#586376' }} align="right">{row.fat}</DiskTableCell>
                  {
                    props.showOpenItem ? 
                    <DiskTableCell align="right">
                      <DiskButton id="disk-button-download" onClick={() => handleOpenCourse(row.id)} style={{ marginRight: 20 }} text={props.diskText.openCourse} color={'primary'} />
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

  // console.log('>>>>>>>>rows', typeof rows, rows)

  const render = () => {
    return (
      <>
        <div className={classSearch.titleBox}>
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
        </div>
        { rows && rows.length > 0 && <DiskTable tabValue={props.tabValue} diskText={props.diskText} showOpenItem={props.showOpenItem} handleOpenCourse={props.handleOpenCourse} /> || <TableEmpty diskText={props.diskText} /> }
      </>
    );
  };
  return render();
};
export default PublicDiskTables