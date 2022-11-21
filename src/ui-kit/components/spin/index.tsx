import Spin, { SpinProps } from 'antd/lib/spin';
import { PropsWithChildren, ReactElement } from 'react';
import './index.css';
type ASpinProps = Pick<
  SpinProps,
  'className' | 'delay' | 'indicator' | 'size' | 'tip' | 'wrapperClassName' | 'spinning'
>;

export function ASpin(props: PropsWithChildren<ASpinProps>): ReactElement {
  const { className = '', ...rest } = props;
  return <Spin {...rest} className={`fcr-theme ${className}`} />;
}
