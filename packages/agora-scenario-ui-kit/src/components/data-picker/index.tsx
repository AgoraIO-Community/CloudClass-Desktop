import generatePicker, {
  PickerBaseProps,
  PickerDateProps,
  PickerTimeProps,
} from 'antd/es/date-picker/generatePicker';
import { Dayjs } from 'dayjs';
import dayjsGenerateConfig from 'rc-picker/es/generate/dayjs';
import React from 'react';
import locale_zh_CN from 'antd/es/date-picker/locale/zh_CN';
import locale_en_US from 'antd/es/date-picker/locale/en_US';
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
  | 'locale'
  | 'picker'
  | 'mode'
  | 'allowClear'
  | 'disabledDate'
  | 'nextIcon'
  | 'prevIcon'
  | 'superNextIcon'
  | 'superPrevIcon'
  | 'renderExtraFooter'
  | 'popupStyle'
  | 'suffixIcon'
> & {
  status?: '' | 'warning' | 'error' | undefined;
  dropdownClassName?: string | undefined;
  popupClassName?: string | undefined;
};

export const ADatePicker = React.forwardRef<any, ADatePickerProps>(
  ({ className = '', popupClassName = '', ...props }, ref) => {
    return (
      <Com
        className={`fcr-theme ${className}`}
        popupClassName={`fcr-theme ${popupClassName}`}
        {...props}
        ref={ref}
      />
    );
  },
);

export const locale = {
  zh_CN: {
    ...locale_zh_CN,
  },
  en_US: locale_en_US,
};
