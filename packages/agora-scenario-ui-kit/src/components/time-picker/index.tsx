import { PickerDateProps, PickerTimeProps } from 'antd/es/date-picker/generatePicker';
import { Dayjs } from 'dayjs';
import * as React from 'react';
import { ADatePicker } from '../data-picker';

interface TimePickerProps extends Omit<PickerTimeProps<Dayjs>, 'picker'> {}

export type ATimePickerProps = Pick<
  TimePickerProps,
  | 'className'
  | 'onChange'
  | 'value'
  | 'defaultValue'
  | 'format'
  | 'minuteStep'
  | 'hourStep'
  | 'secondStep'
  | 'showNow'
  | 'allowClear'
  | 'inputReadOnly'
> &
  Pick<PickerDateProps<Dayjs>, 'disabledTime'>;

export const ATimePicker = React.forwardRef<any, ATimePickerProps>((props, ref) => {
  return <ADatePicker picker="time" mode={undefined} ref={ref} {...props} />;
});

ATimePicker.displayName = 'TimePicker';
