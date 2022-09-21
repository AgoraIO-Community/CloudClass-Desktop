import { Spin, SpinProps } from 'antd';
import { PropsWithChildren, ReactElement } from 'react';

type ASpinProps = Pick<
  SpinProps,
  'className' | 'delay' | 'indicator' | 'size' | 'tip' | 'wrapperClassName' | 'spinning'
>;

export function ASpin(props: PropsWithChildren<ASpinProps>): ReactElement {
  return <Spin {...props} />;
}
