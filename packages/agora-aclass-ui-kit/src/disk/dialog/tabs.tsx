import React from 'react';
import { createStyles, withStyles } from "@material-ui/core/styles";
import { Tab as MTab, Tabs as MTabs, Theme } from "@material-ui/core";

export interface DiskTabsProps {
  value: number;
  onChange: (event: React.ChangeEvent<{}>, newValue: number) => void;
}

export const DiskTabs = withStyles({
  indicator: {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "transparent",
    marginTop: '-2.2rem',
    marginRight: '-1.1rem',
    "& > span": {
      maxWidth: 80,
      width: "100%",
      backgroundColor: "#74BFFF"
    }
  }
})((props: DiskTabsProps) => (
  <MTabs {...props} TabIndicatorProps={{ children: <span /> }} />
));

export interface DiskTabProps {
  id?: string,
  label: string;
}

export const DiskTab = withStyles((theme: Theme) =>
  createStyles({
    root: {
      textTransform: "none",
      color: "#fff",
      fontWeight: 400,
      fontSize: "16px",
      marginRight: '-40px',
      "&:focus": {
        opacity: 1,
      },
      "&:hover": {
        opacity: 1,
      },
      "&:active": {
        color: 0.6,
      },
    }
  })
)((props: DiskTabProps) => <MTab disableRipple {...props} />);