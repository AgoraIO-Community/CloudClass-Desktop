import React, { EventHandler, FC, forwardRef, SyntheticEvent, useState } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import './index.css';
import RcDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.min.css'
import dayjs from 'dayjs'
import { Icon } from '~components';

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
    let hour = Number(evt.currentTarget.dataset.hour || "1")
    setSelectedHour(hour)
  }

  const onSelectMinute = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    let minute = Number(evt.currentTarget.dataset.minute || "0")
    setSelectedMinute(minute)
  }

  const onSelectAMPM = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    let ampm = Number(evt.currentTarget.dataset.ampm || "0")
    setSelectedAMPM(ampm)
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
            <div className="ag-calendar-header-btn-groups">
              <Icon className="rotated" type="backward" onClick={() => decreaseMonth()} />
              <Icon className="rotated" type="forward" onClick={() => increaseMonth()}/>
            </div>
          </div>
        )}
        renderDayContents={(dayOfMonth:number, date?: Date) => {
          let classes = ['ag-calendar-date'];
          let d = dayjs(date);
          let today = dayjs();

          const equalDate = (d1:dayjs.Dayjs, d2:dayjs.Dayjs) => {
            return d1.date() === d2.date() && d1.month() === d2.month() && d1.year() === d2.year()
          }

          equalDate(d, dayjs(startDate)) && classes.push('selected')
          equalDate(d, today) && classes.push('today')

          return <div className={classes.join(' ')}>{dayOfMonth}</div>
        }}
        // customTimeInput={<ExampleCustomTimeInput></ExampleCustomTimeInput>}
      />
      <div className="ag-calendar-time-select-container">
        <div className="ag-calendar-hour-select ag-calendar-time-select">
          {[...Array(12).keys()].map(idx => 
            <li className="ag-calendar-time-item">
              <button data-hour={idx+1} className={(selectedHour === idx + 1) ? "selected w-full" : "w-full"} onClick={onSelectHour}>{`${idx+1}`.padStart(2, '0')}</button>
            </li>
          )}
        </div>
        <div className="ag-calendar-minutes-select ag-calendar-time-select">
          {[...Array(60).keys()].map(idx => 
            <li className="ag-calendar-time-item">
              <button data-minute={idx} className={(selectedMinute === idx) ? "selected w-full" : "w-full"} onClick={onSelectMinute}>{`${idx}`.padStart(2, '0')}</button>
            </li>
          )}
        </div>
      </div>
      <div className="ag-calendar-ampm-select ag-calendar-time-select">
        {[...Array(2).keys()].map(idx => 
          <li className="ag-calendar-time-item">
            <button data-ampm={idx} className={(selectedAMPM === idx) ? "selected w-full" : "w-full"} onClick={onSelectAMPM}>{idx === 0 ? '上午' : '下午'}</button>
          </li>
        )}
      </div>
    </div>
    
  );
};

