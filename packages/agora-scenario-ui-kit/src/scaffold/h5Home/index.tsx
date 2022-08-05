import React from 'react';
import { Button } from '~components/button';
import { transI18n } from '~components/i18n';
import { Input } from '~components/input';
import { Select } from '~components/select';
import { Col, Row, Table } from '~components/table';
import './style.css';

const VALIDATE_REGULAR = /^[a-zA-Z0-9]{6,50}$/;

export const H5Login: React.FC<any> = ({
  roomName,
  onChangeRoomName,
  userName,
  onChangeUserName,
  userId,
  onClick,
  role,
  scenario,
  onChangeScenario,
  version,
  service,
  onChangeService,
  isVocational,
}) => {
  const scenarioOptions = [
    { label: transI18n('home.roomType_interactiveBigClass'), value: 'big-class' },
  ];

  if (isVocational) {
    scenarioOptions.push({
      label: transI18n('home.roomType_vocationalClass'),
      value: 'vocational-class',
    });
  }

  const serviceOptions = [
    { label: transI18n('home.serviceType_premium'), value: 'premium-service' },
    { label: transI18n('home.serviceType_standard'), value: 'standard-service' },
    { label: transI18n('home.serviceType_latency'), value: 'latency-service' },
    { label: transI18n('home.serviceType_mix'), value: 'mix-service' },
  ];

  if (false) {
    serviceOptions.push(
      { label: transI18n('home.serviceType_mix_stream_cdn'), value: 'mix-stream-cdn-service' },
      { label: transI18n('home.serviceType_hosting_scene'), value: 'hosting-scene' },
    );
  }

  return (
    <div className={isVocational ? 'h5-home-vocational' : 'h5-home'}>
      <div className="h5-header">
        <div className="h5-title">{transI18n('home.system_name')}</div>
      </div>
      <Table className="home-h5-form">
        <Row className="home-row-item can-error-item">
          <Col>
            <Input
              inputPrefixWidth={55}
              prefix={
                <span id="et_room_name" className="home-label" title={transI18n('home.roomName')}>
                  {transI18n('home.roomName')}
                </span>
              }
              id="roomName"
              type="text"
              className="block w-full"
              value={roomName}
              onChange={(evt) => onChangeRoomName(evt.currentTarget.value)}
              placeholder={transI18n('home.roomName_placeholder')}
              rule={VALIDATE_REGULAR}
              errorMsg={transI18n('home.input-error-msg')}
              maxLength={50}
            />
          </Col>
        </Row>
        <Row className="home-row-item can-error-item">
          <Col>
            <Input
              inputPrefixWidth={55}
              prefix={
                <span id="et_user_name" className="home-label" title={transI18n('home.nickName')}>
                  {transI18n('home.nickName')}
                </span>
              }
              id="userName"
              type="text"
              className="block w-full"
              value={userName}
              onChange={(evt) => onChangeUserName(evt.currentTarget.value)}
              placeholder={transI18n('home.nickName_placeholder')}
              rule={VALIDATE_REGULAR}
              errorMsg={transI18n('home.input-error-msg')}
              maxLength={50}
            />
          </Col>
        </Row>
        <Row className="home-row-item">
          <Col>
            <Select
              className="home-h5-select"
              prefix={
                <span id="et_room_type" className="home-label" title={transI18n('home.roomType')}>
                  {transI18n('home.roomType')}
                </span>
              }
              id="scenario"
              value={scenario}
              options={scenarioOptions}
              isMenuTextCenter={true}
              onChange={(value) => {
                onChangeScenario(value);
              }}
              placeholder={transI18n('home.roomType_placeholder')}></Select>
          </Col>
        </Row>

        {scenario === 'vocational-class' ? (
          <Row className="home-row-item">
            <Col>
              <Select
                prefix={
                  <span
                    id="et_room_type"
                    className="home-label"
                    title={transI18n('home.serviceType')}>
                    {transI18n('home.serviceType')}
                  </span>
                }
                id="service"
                value={service}
                options={serviceOptions}
                isMenuTextCenter={true}
                onChange={(value) => {
                  onChangeService(value);
                }}
                placeholder={transI18n('home.serviceType_placeholder')}
              />
            </Col>
          </Row>
        ) : null}

        <Button
          id="btn_join"
          className="mt-4 h5-btn-submit"
          type="primary"
          size="lg"
          onClick={onClick}
          disabled={
            !(
              !!userId &&
              !!userName &&
              !!roomName &&
              !!role &&
              !!scenario &&
              /^[a-zA-Z0-9]{1,50}$/.test(roomName) &&
              /^[a-zA-Z0-9]{1,50}$/.test(userName) &&
              (scenario === 'vocational-class' ? !!service : true)
            )
          }>
          {transI18n('home.enter_classroom')}
        </Button>
        <Row className="text-center home-align-center">Version: Flexible Classroom_{version}</Row>
      </Table>
    </div>
  );
};
