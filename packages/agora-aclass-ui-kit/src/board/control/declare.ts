import { CSSProperties } from "@material-ui/core/styles/withStyles";

export type ControlBaseClickEvent = (item: any) => any

export interface ControlBaseProps {
  style?: CSSProperties,
  onClick: ControlBaseClickEvent
}