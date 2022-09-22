import { RoomAPI } from '@/app/api/room';
import watermarkIcon from '@/app/assets/fcr_watermark.svg';
import chatIcon from '@/app/assets/fcr_chat3.svg';
import cameraIcon from '@/app/assets/fcr_invigilate_camera.svg';
import microphoneIcon from '@/app/assets/fcr_invigilate_microphone.svg';
import cdnIcon from '@/app/assets/service-type/fcr_cdn.svg';
import premiumIcon from '@/app/assets/service-type/fcr_premium.svg';
import standardIcon from '@/app/assets/service-type/fcr_standard.svg';
import { RadioIcon } from '@/app/components/radio-icon';
import { RoomTypeCard } from '@/app/components/room-type-card';
import { useHomeStore } from '@/app/hooks';
import { useHistoryBack } from '@/app/hooks/useHistoryBack';
import { useLoading } from '@/app/hooks/useLoading';
import { NavFooter, NavPageLayout } from '@/app/layout/nav-page-layout';
import { EduRoomServiceTypeEnum, EduRoomTypeEnum } from 'agora-edu-core';
import dayjs, { Dayjs } from 'dayjs';
import { observer } from 'mobx-react';
import { useCallback, useMemo, useState } from 'react';
import {
  ADatePicker,
  ADatePickerProps,
  AForm,
  AFormItem,
  AInput,
  aMessage,
  ATimePicker,
  useAForm,
  useI18n,
} from '~components';
import './index.css';
import { RadioCard } from './radio-card';

const weekday = {
  0: 'fcr_create_option_timeselector_Sun',
  1: 'fcr_create_option_timeselector_Mon',
  2: 'fcr_create_option_timeselector_Tue',
  3: 'fcr_create_option_timeselector_Wed',
  4: 'fcr_create_option_timeselector_Thu',
  5: 'fcr_create_option_timeselector_Fri',
  6: 'fcr_create_option_timeselector_Sat',
};

const TimeFormat = 'HH:mm';

const computeEndTime = (date: Dayjs) => {
  return date.add(30, 'minute');
};

type CreateFormValue = {
  name: string;
  date: Dayjs;
  time: Dayjs;
  link: string;
};

export const CreateRoom = observer(() => {
  const homeStore = useHomeStore();
  const historyBackHandle = useHistoryBack();
  const transI18n = useI18n();

  const customFormat: ADatePickerProps['format'] = (value) =>
    `${value.format('YYYY-MM-DD')}  |  ${transI18n(weekday[value.day()])}`;

  const roomTypeOptions = [
    {
      label: transI18n('fcr_h5create_label_1on1'),
      description: transI18n('fcr_create_label_1on1_description'),
      value: EduRoomTypeEnum.Room1v1Class,
      className: 'card-purple',
    },
    {
      label: transI18n('fcr_h5create_label_small_classroom'),
      description: transI18n('fcr_create_label_smallclassroom_description'),
      value: EduRoomTypeEnum.RoomSmallClass,
      className: 'card-red',
    },
    {
      label: transI18n('fcr_h5create_label_lecture_hall'),
      description: transI18n('fcr_create_label_lecturehall_description'),
      value: EduRoomTypeEnum.RoomBigClass,
      className: 'card-green',
    },
    {
      label: transI18n('fcr_h5create_label_study_room'),
      description: transI18n('fcr_create_label_lecturehall_description'),
      value: EduRoomTypeEnum.RoomSelfStudy,
      className: 'card-green',
    },
  ];

  const serviceTypeOptions = [
    {
      label: transI18n('fcr_create_label_servicetype_RTC'),
      description: transI18n('fcr_create_label_latency_RTC'),
      value: EduRoomServiceTypeEnum.LivePremium,
      icon: <img src={premiumIcon} />,
    },
    {
      label: transI18n('fcr_create_label_servicetype_Standard'),
      description: transI18n('fcr_create_label_latency_Standard'),
      value: EduRoomServiceTypeEnum.LiveStandard,
      icon: <img src={standardIcon} />,
    },
    {
      label: transI18n('fcr_create_label_servicetype_CDN'),
      description: transI18n('fcr_create_label_latency_CDN'),
      value: EduRoomServiceTypeEnum.Fusion,
      icon: <img src={cdnIcon} />,
    },
  ];
  const [showMore, setShowMore] = useState(false);
  const [roomType, setRoomType] = useState(roomTypeOptions[0].value);
  const [serviceType, setServiceType] = useState(serviceTypeOptions[0].value);
  const [watermark, setWatermark] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micorphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [livePlayback, setLivePlayback] = useState(true);
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [dateTimeValidate, setDateTimeValidate] = useState({
    validateStatus: 'success',
    help: '',
    tip: '',
  });
  const [form] = useAForm<CreateFormValue>();
  const { setLoading } = useLoading();

  const initialValues: CreateFormValue = useMemo(() => {
    const date = dayjs();
    return {
      name: '',
      date: date,
      time: date,
      link: '',
    };
  }, []);

  const [endTime, setEndTime] = useState(() => {
    return computeEndTime(initialValues.date).format(TimeFormat);
  });

  const getFormDateTime = useCallback(() => {
    const time: Dayjs = form.getFieldValue('time');
    const date: Dayjs = form.getFieldValue('date');
    time.set('year', date.year());
    time.set('month', date.month());
    time.set('date', date.date());
    return time;
  }, [form]);

  const checkFormDateTimeIsAfterNow = useCallback(() => {
    // 如果使用当前时间就跳过日期时间校验
    if (useCurrentTime) {
      return true;
    }
    const dateTime = getFormDateTime();
    if (dateTime.isAfter(dayjs())) {
      setDateTimeValidate({ validateStatus: 'success', help: '', tip: '' });
      return true;
    }
    setDateTimeValidate({
      validateStatus: 'error',
      help: '',
      tip: transI18n('fcr_create_tips_starttime'),
    });
    return false;
  }, [useCurrentTime, getFormDateTime]);

  const recomputeEndTime = useCallback(() => {
    const dateTime = getFormDateTime();
    setEndTime(computeEndTime(dateTime).format(TimeFormat));
  }, [getFormDateTime]);

  const dateTimeOnChange = useCallback(
    (value: Dayjs | null) => {
      if (value) {
        setUseCurrentTime(false);
        checkFormDateTimeIsAfterNow();
        recomputeEndTime();
      }
    },
    [checkFormDateTimeIsAfterNow],
  );

  const onSubmit = () => {
    if (!checkFormDateTimeIsAfterNow()) {
      return;
    }
    form.validateFields().then((data) => {
      setLoading(true);
      const { date, time, name, link } = data;
      let dateTime = dayjs();
      if (!useCurrentTime) {
        time.set('year', date.year());
        time.set('month', date.month());
        time.set('date', date.date());
        dateTime = time;
      }
      const hostingScene = livePlayback
        ? {
          videoURL: link,
          reserveVideoURL: link,
          finishType: 0,
        }
        : undefined;
      const sType = livePlayback ? EduRoomServiceTypeEnum.HostingScene : serviceType;
      RoomAPI.shared
        .create({
          roomName: name,
          startTime: dateTime.valueOf(),
          endTime: computeEndTime(dateTime).valueOf(),
          roomType,
          roomProperties: {
            watermark,
            hostingScene,
            serviceType: sType,
            cameraEnabled,
            micorphoneEnabled,
            chatEnabled
          },
        })
        .then(() => {
          homeStore.addRoomListToast({
            id: 'create_room_success',
            type: 'success',
            desc: transI18n('fcr_create_tips_create_success'),
          });
          setTimeout(() => {
            homeStore.removeRoomListToast('create_room_success');
          }, 2500);
          historyBackHandle();
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
                pattern: /^([a-zA-Z0-9_\u4e00-\u9fa5]{0,50})$/,
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
                  minuteStep={10}
                  allowClear={false}
                  showNow={false}
                  onChange={dateTimeOnChange}
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
            <div className="label">{transI18n('fcr_create_label_endtime')}</div>
            <div className="end-time-picker">
              {endTime}
              <span>{transI18n('fcr_create_label_defaulttime')}</span>
            </div>
          </div>
        </div>
        {/* 班型 */}
        <div className="form-item item-mb">
          <div className="label">{transI18n('fcr_create_label_classmode')}</div>
          <div className="room-type">
            {roomTypeOptions.map((v) => {
              return (
                <RoomTypeCard
                  title={v.label}
                  checked={roomType === v.value}
                  className={v.className}
                  key={v.value + v.label}
                  onClick={() => {
                    setRoomType(v.value);
                  }}
                  description={v.description}
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
                    label={v.label}
                    description={v.description}
                    icon={v.icon}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
        {/* 更多设置 */}
        <div className="form-item item-mb more-settings">
          <div className="label">
            {transI18n('fcr_create_label_moresettings')}
            <span
              className={`expand ${showMore ? 'hidden' : ''}`}
              onClick={() => {
                setShowMore((pre) => !pre);
              }}>
              {transI18n('fcr_create_more_settings_expand')}
            </span>
          </div>
          <div className={`settings ${!showMore ? 'hidden' : ''}`}>
            <div className="setting-item">
              <div className="title">
                <div className="security-prefix-icon" />
                {transI18n('fcr_create_label_person_count_limitation')}
              </div>
              <div className="content">
                <AFormItem
                  name="numberOfParticipants"
                  rules={[
                    {
                      required: true,
                      message: transI18n('fcr_create_tips_number_of_participants'),
                    },
                    {
                      pattern: /^([0-9]{0,10})$/,
                      message: transI18n('fcr_create_tips_number_of_participants_invalid'),
                    },
                  ]}>
                  <AInput
                    maxLength={10}
                    placeholder={transI18n('fcr_create_tips_number_of_participants')} />
                </AFormItem>
              </div>
            </div>
            <div className="setting-item">
              <div className="title">
                <div className="security-prefix-icon" />
                {transI18n('fcr_create_label_function_setting')}
              </div>
              <div className="content flex" style={{ gap: 16 }}>
                <RadioCard
                  className={'watermark-card'}
                  onClick={() => {
                    setCameraEnabled((pre) => !pre);
                  }}
                  disabled
                  checked={cameraEnabled}
                  label={transI18n('fcr_create_label_camera')}
                  icon={<img src={cameraIcon}></img>}
                />
                <RadioCard
                  className={'watermark-card'}
                  onClick={() => {
                    setMicrophoneEnabled((pre) => !pre);
                  }}
                  disabled
                  checked={micorphoneEnabled}
                  label={transI18n('fcr_create_label_microphone')}
                  icon={<img src={microphoneIcon}></img>}
                />
                <RadioCard
                  className={'watermark-card'}
                  onClick={() => {
                    setChatEnabled((pre) => !pre);
                  }}
                  disabled
                  checked={chatEnabled}
                  label={transI18n('fcr_create_label_chat')}
                  icon={<img src={chatIcon}></img>}
                />
              </div>
            </div>

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
            {roomType === EduRoomTypeEnum.RoomBigClass ? (
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
