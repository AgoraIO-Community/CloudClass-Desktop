import React from 'react'
import {Checkbox, CheckboxProps, withStyles} from "@material-ui/core";

// check box styles
export const DiskCheckbox = withStyles({
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