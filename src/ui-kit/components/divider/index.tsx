import Divider, { DividerProps } from 'antd/lib/divider';
import { PropsWithChildren, ReactElement } from 'react';

type ADividerProps = Pick<
  DividerProps,
  'className' | 'dashed' | 'orientation' | 'orientationMargin' | 'plain' | 'style' | 'type'
>;

export function ADivider(props: PropsWithChildren<ADividerProps>): ReactElement {
  return <Divider {...props} />;
}
