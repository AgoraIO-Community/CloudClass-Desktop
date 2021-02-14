import React from 'react';
import {createStyles, TableCell, withStyles} from "@material-ui/core";

export const DiskTableCellHead = withStyles(() =>
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

export const DiskTableCell = withStyles(() =>
  createStyles({
    head: {
      color: '#fff',
    },
    body: {
      color: '#273D75',
    }
  }),
)(TableCell);

export const DownloadTableCell = withStyles(() =>
  createStyles({
    head: {
      backgroundColor: '#F0F3FF',
      color: '#273D75',
    },
    body: {
      color: '#273D75',
    }
  }),
)(TableCell);
