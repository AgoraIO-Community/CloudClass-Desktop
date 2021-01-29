
export interface INavigation {
  background?: string,
  minHeight?: number,
  color?: string,
  leftContainer?: INavigationItem[]
  rightContainer?: INavigationItem[],
  leftContainerStyle?: React.CSSProperties,
  rightContainerStyle?: React.CSSProperties
}
export interface INavigationItem {
  icon?: () => React.ReactNode,
  componentKey: string,
  text?: string,
  onclickItem?: (args: any) => any,
  isComponent: boolean,
  renderItem?: () => React.ReactNode,
  style?: React.CSSProperties

}
