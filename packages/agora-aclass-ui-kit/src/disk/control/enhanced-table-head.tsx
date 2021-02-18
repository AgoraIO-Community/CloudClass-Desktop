import React from 'react';
import { TableHead, TableRow } from "@material-ui/core";
import { DiskTableCellHead} from "../dialog/table-cell";
import { DiskCheckbox } from "./checkbox";
import { makeStyles } from '@material-ui/core/styles';

export interface EnhancedTableProps {
  numSelected: number;
  // onRequestSort: (event: React.MouseEvent<unknown>, property: any) => void;
  onSelectAllClick?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowCount: number;
  diskText?: any,
  showCheckbox?: boolean,
}

const useStyles = makeStyles({
  showCheckbox: {
    paddingLeft: 0,
  },
  noCheckbox: {
    paddingLeft: 15,
  },
  text: {
    color: '#586376',
  }
})

export const EnhancedTableHead = (props: EnhancedTableProps) => {
  const { onSelectAllClick, numSelected, rowCount, diskText, showCheckbox } = props;
  const classes = useStyles()

  const classKey = showCheckbox ? classes.showCheckbox : classes.noCheckbox

  return (
    <TableHead>
      <TableRow style={{ color: '#273D75' }}>
        { showCheckbox && <DiskTableCellHead padding="checkbox">
          <DiskCheckbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </DiskTableCellHead>
         }
        <DiskTableCellHead className={classKey} id="name" key="name" scope="row">{diskText.fileName}</DiskTableCellHead>
        <DiskTableCellHead className={classes.text} id="calories" key="calories" align="right">{diskText.size}</DiskTableCellHead>
        <DiskTableCellHead className={classes.text} id="fat" key="fat" align="right">{diskText.modificationTime}</DiskTableCellHead>
        <DiskTableCellHead className={classes.text} id="operation" key="operation" align="right">{diskText.operation}</DiskTableCellHead>
      </TableRow>
    </TableHead>
  );
}