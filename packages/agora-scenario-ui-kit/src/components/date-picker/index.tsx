import React, { EventHandler, FC, forwardRef, SyntheticEvent, useState } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import './index.css';
import RcDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.min.css'
import dayjs from 'dayjs'

export interface DatePickerProps extends BaseProps {
  inputClassName?: string
  calendarClassName?: string
}

export const DatePicker: FC<DatePickerProps> = ({
  inputClassName,
  calendarClassName,
  ...restProps
}) => {
  const inputcls = classnames({
    [`${inputClassName}`]: !!inputClassName,
  });
  const calendarcls = classnames({
    [`${calendarClassName}`]: !!calendarClassName,
  });
  const [startDate, setStartDate] = useState(new Date());
  const [isOpen, setOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(1)
  const [selectedMinute, setSelectedMinute] = useState(0)
  const [selectedAMPM, setSelectedAMPM] = useState(0)


  const onSelectHour = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    evt.currentTarget.id
  }

  return (
    <div className="ag-calendar-container">
      <RcDatePicker
        selected={startDate}
        onChange={date => setStartDate(date)}
        // showTimeSelect
        className={inputcls}
        calendarClassName={calendarcls}
        inline={true}
        renderCustomHeader={({
          date,
          changeYear,
          changeMonth,
          decreaseMonth,
          increaseMonth,
          prevMonthButtonDisabled,
          nextMonthButtonDisabled
        }) => (
          <div className="ag-calendar-header">
            {dayjs(date).format('YYYY年MM月')}
          </div>
        )}
        // customTimeInput={<ExampleCustomTimeInput></ExampleCustomTimeInput>}
      />
      <div className="ag-calendar-time-select-container">
        <div className="ag-calendar-hour-select ag-calendar-time-select">
          {[...Array(12).keys()].map(idx => <li className="ag-calendar-time-item"><button className="w-full" onClick={onSelectHour}>{`${idx+1}`.padStart(2, '0')}</button></li>)}
        </div>
        <div className="ag-calendar-minutes-select ag-calendar-time-select">
          {[...Array(60).keys()].map(idx => <div className="ag-calendar-time-item">{`${idx}`.padStart(2, '0')}</div>)}
        </div>
      </div>
      <div className="ag-calendar-ampm-select ag-calendar-time-select">
        {[...Array(2).keys()].map(idx => <div className="ag-calendar-time-item">{idx === 0 ? '上午' : '下午'}</div>)}
      </div>
    </div>
    
  );
};

