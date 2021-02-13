import React from 'react';
import { TableHead, TableRow } from "@material-ui/core";
import { DiskTableCellHead} from "../dialog/table-cell";
import { DiskCheckbox } from "./checkbox";

export interface EnhancedTableProps {
  numSelected: number;
  // onRequestSort: (event: React.MouseEvent<unknown>, property: any) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowCount: number;
}

export const EnhancedTableHead = (props: EnhancedTableProps) => {
  const { onSelectAllClick, numSelected, rowCount, } = props;

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
        <DiskTableCellHead style={{ color: '#586376' }} id="calories" key="calories" align="right">大小</DiskTableCellHead>
        <DiskTableCellHead style={{ color: '#586376' }} id="fat" key="fat" align="right">修改时间</DiskTableCellHead>
      </TableRow>
    </TableHead>
  );
}
