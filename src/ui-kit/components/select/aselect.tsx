import { Select, SelectProps } from 'antd';
import React, { FC } from 'react';
type ASelectProps = Pick<
  SelectProps,
  'className' | 'options' | 'disabled' | 'mode' | 'value' | 'onChange'
>;

export const ASelect: FC<ASelectProps> = ({ className = '', ...props }) => {
  return <Select {...props} />;
};
