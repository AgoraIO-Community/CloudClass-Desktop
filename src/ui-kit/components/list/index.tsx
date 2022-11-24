import List, { ListProps } from 'antd/lib/list';
import { PropsWithChildren, ReactElement } from 'react';

type AListProps<T = any> = Pick<
  ListProps<T>,
  | 'className'
  | 'bordered'
  | 'footer'
  | 'header'
  | 'loading'
  | 'loadMore'
  | 'pagination'
  | 'renderItem'
  | 'rowKey'
  | 'size'
  | 'split'
  | 'dataSource'
>;

export function AList<T = any>(props: PropsWithChildren<AListProps<T>>): ReactElement {
  return <List<T> {...props} />;
}
export const AListItem = List.Item;
