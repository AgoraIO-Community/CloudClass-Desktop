import watermarkIcon from '@/app/assets/fcr_watermark.svg';
import cdnIcon from '@/app/assets/service-type/fcr_cdn.svg';
import premiumIcon from '@/app/assets/service-type/fcr_premium.svg';
import standardIcon from '@/app/assets/service-type/fcr_standard.svg';
import { RadioIcon } from '@/app/components/radio-icon';
import { RoomTypeCard } from '@/app/components/room-type-card';
import { useElementWithI18n, useJoinRoom } from '@/app/hooks';
import { useHistoryBack } from '@/app/hooks/useHistoryBack';
import { NavFooter, NavPageLayout } from '@/app/layout/nav-page-layout';
import { GlobalStoreContext, RoomStoreContext, UserStoreContext } from '@/app/stores';
import { Default_Hosting_URL } from '@/app/utils';
import { EduRoleTypeEnum, EduRoomServiceTypeEnum, EduRoomTypeEnum, Platform } from 'agora-edu-core';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { observer } from 'mobx-react';
import { useCallback, useContext, useMemo, useState } from 'react';
import {
  ADatePicker,
  ADatePickerProps,
  AForm,
  AFormItem,
  AInput,
  aMessage,
  ATimePicker,
  locale,
  SvgIconEnum,
  SvgImg,
  useAForm,
  useI18n,
} from '~ui-kit';
import './index.css';
import { RadioCard } from './radio-card';

const weekday = {
  0: 'fcr_create_option_time_selector_Sun',
  1: 'fcr_create_option_time_selector_Mon',
  2: 'fcr_create_option_time_selector_Tue',
  3: 'fcr_create_option_time_selector_Wed',
  4: 'fcr_create_option_time_selector_Thu',
  5: 'fcr_create_option_time_selector_Fri',
  6: 'fcr_create_option_time_selector_Sat',
};

const TimeFormat = 'HH:mm';

const computeEndTime = (date: Dayjs) => {
  return date.add(30, 'minute');
};

const combDateTime = (date: Dayjs, time: Dayjs) => {
  const result = new Date(
    date.year(),
    date.month(),
    date.date(),
    time.hour(),
    time.minute(),
    time.second(),
  );
  return dayjs(result);
};

type CreateFormValue = {
  name: string;
  date: Dayjs;
  time: Dayjs;
  link: string;
};

const roomTypeOptions = [
  {
    label: 'fcr_h5create_label_small_classroom',
    description: 'fcr_create_label_small_classroom_description',
    value: EduRoomTypeEnum.RoomSmallClass,
    className: 'card-purple',
  },
  {
    label: 'fcr_h5create_label_lecture_hall',
    description: 'fcr_create_label_lecture_hall_description',
    value: EduRoomTypeEnum.RoomBigClass,
    className: 'card-red',
  },
  {
    label: 'fcr_h5create_label_1on1',
    description: 'fcr_create_label_1on1_description',
    value: EduRoomTypeEnum.Room1v1Class,
    className: 'card-green',
  },
];

const serviceTypeOptions = [
  {
    label: 'fcr_create_label_service_type_RTC',
    description: 'fcr_create_label_latency_RTC',
    value: EduRoomServiceTypeEnum.LivePremium,
    icon: <img src={premiumIcon} />,
  },
  {
    label: 'fcr_create_label_service_type_Standard',
    description: 'fcr_create_label_latency_Standard',
    value: EduRoomServiceTypeEnum.LiveStandard,
    icon: <img src={standardIcon} />,
  },
  {
    label: 'fcr_create_label_service_type_CDN',
    description: 'fcr_create_label_latency_CDN',
    value: EduRoomServiceTypeEnum.Fusion,
    icon: <img src={cdnIcon} />,
  },
];

export const CreateRoom = observer(() => {
  const roomStore = useContext(RoomStoreContext);
  const { setLoading } = useContext(GlobalStoreContext);
  const userStore = useContext(UserStoreContext);
  const { quickJoinRoom } = useJoinRoom();
  const historyBackHandle = useHistoryBack();
  const transI18n = useI18n();

  const [form] = useAForm<CreateFormValue>();
  const [showMore, setShowMore] = useState(false);
  const [roomType, setRoomType] = useState(roomTypeOptions[0].value);
  const [serviceType, setServiceType] = useState(serviceTypeOptions[0].value);
  const [watermark, setWatermark] = useState(false);
  const [livePlayback, setLivePlayback] = useState(false);
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [dateTimeValidate, setDateTimeValidate] = useState({
    validateStatus: 'success',
    help: '',
    tip: '',
  });

  const showLivePlaybackOption =
    roomType === EduRoomTypeEnum.RoomBigClass && serviceType === EduRoomServiceTypeEnum.Fusion;

  const customFormat: ADatePickerProps['format'] = useCallback(
    (value) => `${value.format('YYYY-MM-DD')}  |  ${transI18n(weekday[value.day()])}`,
    [],
  );

  const initialValues: CreateFormValue = useMemo(() => {
    const date = dayjs();
    return {
      name: transI18n('fcr_create_label_room_name_default', { name: userStore.nickName }),
      date: date,
      time: date,
      link: Default_Hosting_URL,
    };
  }, []);

  const [endTime, setEndTime] = useState(() => {
    return computeEndTime(initialValues.date).format(TimeFormat);
  });

  const dateLocale = useElementWithI18n({ zh: locale.zh_CN, en: locale.en_US });

  const getFormDateTime = useCallback(() => {
    const time: Dayjs = form.getFieldValue('time');
    const date: Dayjs = form.getFieldValue('date');
    return combDateTime(date, time);
  }, [form]);

  const checkFormDateTimeIsAfterNow = useCallback(
    (skip: boolean) => {
      // 如果使用当前时间就跳过日期时间校验
      if (skip) {
        return true;
      }
      const dateTime = getFormDateTime();
      if (!dateTime.isBefore(dayjs())) {
        setDateTimeValidate({ validateStatus: 'success', help: '', tip: '' });
        return true;
      }
      setDateTimeValidate({
        validateStatus: 'error',
        help: '',
        tip: transI18n('fcr_create_tips_starttime'),
      });
      return false;
    },
    [getFormDateTime],
  );

  const recomputeEndTime = useCallback(() => {
    const dateTime = getFormDateTime();
    setEndTime(computeEndTime(dateTime).format(TimeFormat));
  }, [getFormDateTime]);

  const dateTimeOnChange = useCallback(
    (value: Dayjs | null) => {
      if (value) {
        setUseCurrentTime(false);
        checkFormDateTimeIsAfterNow(false);
        recomputeEndTime();
      }
    },
    [checkFormDateTimeIsAfterNow, recomputeEndTime],
  );

  const onSubmit = () => {
    if (!checkFormDateTimeIsAfterNow(useCurrentTime)) {
      return;
    }
    form.validateFields().then((data) => {
      setLoading(true);
      const { date, time, name, link } = data;
      const dateTime = useCurrentTime ? dayjs() : combDateTime(date, time);

      const isHostingScene =
        livePlayback &&
        roomType === EduRoomTypeEnum.RoomBigClass &&
        serviceType === EduRoomServiceTypeEnum.Fusion;

      const hostingScene = isHostingScene
        ? {
            videoURL: link,
            reserveVideoURL: link,
            finishType: 0,
          }
        : undefined;

      const sType = isHostingScene ? EduRoomServiceTypeEnum.HostingScene : serviceType;

      roomStore
        .createRoom({
          roomName: name,
          startTime: dateTime.valueOf(),
          endTime: computeEndTime(dateTime).valueOf(),
          roomType,
          roomProperties: {
            watermark,
            hostingScene,
            serviceType: sType,
          },
        })
        .then((data) => {
          if (useCurrentTime) {
            return quickJoinRoom({
              roomId: data.roomId,
              role: EduRoleTypeEnum.teacher,
              nickName: userStore.nickName,
              userId: userStore.userInfo!.companyId,
              platform: Platform.PC,
            });
          } else {
            historyBackHandle();
          }
        })
        .catch(() => {
          aMessage.error(transI18n('fcr_create_tips_create_failed'));
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  return (
    <NavPageLayout
      title={transI18n('fcr_create_label_create_classroom')}
      className="create-room"
      footer={
        <NavFooter
          okText={transI18n('fcr_create_button_create')}
          cancelText={transI18n('fcr_create_button_cancel')}
          onOk={onSubmit}
          onCancel={historyBackHandle}
        />
      }>
      <AForm<CreateFormValue>
        className="create-form header-blank footer-blank"
        form={form}
        initialValues={initialValues}>
        {/* 课程名称 */}
        <div className="form-item">
          <div className="label">{transI18n('fcr_create_label_room_name')}</div>
          <AFormItem
            name="name"
            rules={[
              { required: true, message: transI18n('fcr_create_label_room_name_empty') },
              {
                pattern: /^([ 'a-zA-Z0-9_\u4e00-\u9fa5]{0,50})$/,
                message: transI18n('fcr_create_room_tips_name_rule'),
              },
            ]}>
            <AInput
              maxLength={50}
              showCount={{
                formatter: (args) => (args.maxLength || 50) - args.count,
              }}
              placeholder={transI18n('fcr_create_tips_room_name')}
              className="create-input"
            />
          </AFormItem>
        </div>
        {/* 课程时间 */}
        <div className="form-item flex">
          <div className="start-time">
            <div className="label">{transI18n('fcr_create_label_starttime')}</div>
            <AFormItem
              name="date"
              rules={[{ required: true, message: 'Please select date!' }]}
              {...dateTimeValidate}>
              <ADatePicker
                className="start-date-picker"
                format={customFormat}
                allowClear={false}
                disabledDate={(current) => {
                  const now = dayjs().set('hour', 0).set('minute', 0).set('second', 0);
                  return !dayjs(current).isBetween(now, now.add(7, 'day'));
                }}
                onChange={dateTimeOnChange}
                superNextIcon={null}
                superPrevIcon={null}
                suffixIcon={<SvgImg type={SvgIconEnum.CALENDAR} />}
                popupStyle={{ marginTop: '8px' }}
                locale={dateLocale}
              />
            </AFormItem>
            <div className="relative inline-block">
              <AFormItem
                name="time"
                rules={[{ required: true, message: 'Please select time!' }]}
                {...dateTimeValidate}>
                <ATimePicker
                  className="start-time-picker"
                  format={TimeFormat}
                  inputReadOnly
                  minuteStep={5}
                  allowClear={false}
                  showNow={false}
                  onChange={dateTimeOnChange}
                  popupStyle={{ marginTop: '8px' }}
                />
              </AFormItem>
              <div className={`current-time ${useCurrentTime ? '' : 'hidden'}`}>
                {transI18n('fcr_create_room_current_time')}
              </div>
            </div>
            <div className="tip">{dateTimeValidate.tip}</div>
          </div>
          <div className="gap-symbol" />
          <div className="end-time">
            <div className="label">{transI18n('fcr_create_label_end_time')}</div>
            <div className="end-time-picker">
              {endTime}
              <span>{transI18n('fcr_create_label_default_time')}</span>
            </div>
          </div>
        </div>
        {/* 班型 */}
        <div className="form-item item-mb">
          <div className="label">{transI18n('fcr_create_label_class_mode')}</div>
          <div className="room-type">
            {roomTypeOptions.map((v) => {
              return (
                <RoomTypeCard
                  title={transI18n(v.label)}
                  description={transI18n(v.description)}
                  checked={roomType === v.value}
                  className={v.className}
                  key={v.value + v.label}
                  onClick={() => {
                    setRoomType(v.value);
                  }}
                />
              );
            })}
          </div>
        </div>
        {/* 服务类型 */}
        {roomType === EduRoomTypeEnum.RoomBigClass ? (
          <div className="form-item item-mb ">
            <div className="label">{transI18n('fcr_create_label_latency_type')}</div>
            <div className="service-type">
              {serviceTypeOptions.map((v) => {
                return (
                  <RadioCard
                    key={v.value + v.label}
                    onClick={() => {
                      setServiceType(v.value);
                    }}
                    checked={v.value === serviceType}
                    label={transI18n(v.label)}
                    description={transI18n(v.description)}
                    icon={v.icon}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
        {/* 更多设置 */}
        <div
          className={classNames({
            'form-item item-mb more-settings': 1,
            expanded: showMore,
          })}>
          <div className="label">
            {transI18n('fcr_create_label_more_settings')}
            <span
              className={classNames({
                'expand-btn': 1,
                hidden: showMore,
              })}
              onClick={() => {
                setShowMore((pre) => !pre);
              }}>
              {transI18n('fcr_create_more_settings_expand')}
            </span>
          </div>
          <div
            className={classNames({
              'more-setting-list': 1,
              hidden: !showMore,
            })}>
            <div className="setting-item">
              <div className="title">
                <div className="security-prefix-icon" />
                {transI18n('fcr_create_label_security')}
              </div>
              <div className="content">
                {/* 水印 */}
                <RadioCard
                  className={'watermark-card'}
                  onClick={() => {
                    setWatermark((pre) => !pre);
                  }}
                  checked={watermark}
                  label={transI18n('fcr_create_label_watermark')}
                  icon={<img src={watermarkIcon}></img>}
                />
              </div>
            </div>
            {showLivePlaybackOption ? (
              <div className="setting-item">
                <div className="title">
                  <div className="live-playback-prefix-icon" />
                  {transI18n('fcr_create_label_playback')}
                </div>
                <div className="content">
                  {/* 伪直播 */}
                  <div className="live-playback">
                    <div
                      className="header"
                      onClick={() => {
                        setLivePlayback((pre) => !pre);
                      }}>
                      <span className="flex-1">
                        {transI18n('fcr_create_label_playback_description')}
                      </span>
                      <RadioIcon checked={livePlayback} />
                    </div>
                    <div className={`link ${!livePlayback ? 'hidden' : ''}`}>
                      <div className="link-label">
                        {transI18n('fcr_create_label_playback_link')}
                      </div>
                      <AFormItem
                        name="link"
                        rules={[
                          {
                            required: livePlayback,
                            message: transI18n('fcr_create_tips_room_playback_link'),
                          },
                        ]}>
                        <AInput />
                      </AFormItem>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </AForm>
    </NavPageLayout>
  );
});
