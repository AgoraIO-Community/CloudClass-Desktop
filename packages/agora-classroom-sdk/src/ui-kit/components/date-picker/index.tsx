import React, { EventHandler, FC, forwardRef, SyntheticEvent, useState, useRef, useEffect } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import './index.css';
import { Calendar } from '~components/calendar'
import { Popover } from '~components/popover'
import { Icon } from '~components/icon';
import dayjs from 'dayjs'
import iconCalendarSvg from '~components/icon/assets/svg/icon-calendar.svg'

export interface DatePickerProps extends BaseProps {
  className?: string
  onChangeDate?: (date:Date) => void
}

export const DatePicker: FC<DatePickerProps> = ({
  className,
  onChangeDate,
  ...restProps
}) => {
  let today = new Date()
  const [selectedDate, setSelectedDate] = useState(today);
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
  const cls = classnames({
    [`${className}`]: !!className,
    ['ag-date-picker']: 1
  });

  const onChangeDateTime = (date:Date) => {
    setSelectedDate(date)
    onChangeDate && onChangeDate(date)
  }

  return (
    <Popover
      visible={popoverVisible}
      onVisibleChange={(visible) => setPopoverVisible(visible)}
      overlayClassName="expand-tools-popover"
      trigger="click"
      placement="bottom"
      content={<Calendar selectedDate={today} onChange={onChangeDateTime}/>}
    >
      <div className={cls}>
        <span>{dayjs(selectedDate).format('YYYY/MM/DD HH:mm')}</span>
        <img src={iconCalendarSvg} width={20} height={20}/>
      </div>
    </Popover>
  );
};

