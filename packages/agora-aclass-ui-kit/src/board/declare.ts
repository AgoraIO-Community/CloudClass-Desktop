import { CSSProperties } from "@material-ui/core/styles/withStyles";

export type ItemBaseClickEvent = (item: any) => any

export interface ControlBaseProps {
  style?: CSSProperties,
  onClick: ItemBaseClickEvent
}