import { PickerDateProps, PickerTimeProps } from 'antd/lib/date-picker/generatePicker';
import { Dayjs } from 'dayjs';
import * as React from 'react';
import { ADatePicker, ADatePickerProps } from '../date-picker';
import './index.css';
type TimePickerProps = Omit<PickerTimeProps<Dayjs>, 'picker'>

type DisabledTime = Pick<PickerDateProps<Dayjs>, 'disabledTime'>;
export type ATimePickerProps = ADatePickerProps &
  DisabledTime &
  Pick<
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
    | 'popupStyle'
  > & {
    status?: '' | 'warning' | 'error' | undefined;
    dropdownClassName?: string | undefined;
    popupClassName?: string | undefined;
  };

export const ATimePicker = React.forwardRef<any, ATimePickerProps>(
  // eslint-disable-next-line react/prop-types
  ({ className = '', popupClassName = '', ...props }, ref) => {
    return (
      <ADatePicker
        picker="time"
        className={`fcr-theme ${className}`}
        popupClassName={`fcr-theme ${popupClassName}`}
        mode={undefined}
        ref={ref}
        {...props}
      />
    );
  },
);

ATimePicker.displayName = 'TimePicker';
