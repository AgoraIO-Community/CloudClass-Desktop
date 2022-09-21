import generatePicker, {
  PickerBaseProps,
  PickerDateProps,
  PickerTimeProps,
} from 'antd/es/date-picker/generatePicker';
import { Dayjs } from 'dayjs';
import dayjsGenerateConfig from 'rc-picker/es/generate/dayjs';
import React from 'react';
import './extend';
import './index.css';

// TODO: antd 4.0  后的bug，需要升级 react
const Com: any = generatePicker<Dayjs>(dayjsGenerateConfig as any);

export type ADatePickerProps = Pick<
  PickerBaseProps<Dayjs> | PickerDateProps<Dayjs> | PickerTimeProps<Dayjs>,
  | 'className'
  | 'onChange'
  | 'value'
  | 'defaultValue'
  | 'format'
  | 'picker'
  | 'mode'
  | 'allowClear'
  | 'disabledDate'
>;
export const ADatePicker = React.forwardRef<any, ADatePickerProps>(
  ({ className = '', ...props }, ref) => {
    return <Com className={`fcr-theme ${className}`} {...props} ref={ref} />;
  },
);
