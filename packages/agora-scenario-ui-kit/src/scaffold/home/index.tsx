import classnames from 'classnames';
import React from 'react';
import { Button } from '~components/button';
import { Card } from '~components/card';
import { Input } from '~components/input';
import { Header, Layout } from '~components/layout';
import { Select } from '~components/select';
import { Col, Row, Table } from '~components/table';
import { useI18n } from '~ui-kit/components';
import { HomeModule } from '~utilities/types';
import './index.css';

export interface HomeAttributes {
  roomId: string;
  userId: string;
  userName: string;
  roomName: string;
  role: string;
  scenario: string;
  service?: string;
  duration: number;
  language: string;
  region: string;
  encryptionMode: string;
  encryptionKey: string;
  showServiceOptions: boolean;
}

export interface HomeProps extends Omit<HomeModule<HomeAttributes>, 'onChangeShowServiceOptions'> {
  onClick: () => void | Promise<void>;
  isVocational?: boolean;
  version: string;
  SDKVersion: string;
  buildTime: string;
  commitID: string;
  loading: boolean;
  headerRight?: React.ReactNode;
  children?: React.ReactNode;
}

export const Home: React.FC<HomeProps> = ({
  isVocational,
  roomId,
  userId,
  userName,
  roomName,
  role,
  scenario,
  service,
  duration,
  version,
  SDKVersion,
  buildTime,
  commitID,
  language,
  region,
  encryptionMode,
  encryptionKey,
  loading,
  onChangeEncryptionMode,
  onChangeEncryptionKey,
  onChangeRole,
  onChangeScenario,
  onChangeService,
  onChangeLanguage,
  onChangeDuration,
  onChangeRegion,
  onChangeRoomId,
  onChangeUserId,
  onChangeUserName,
  onChangeRoomName,
  onClick,
  showServiceOptions,
  headerRight,
  ...restProps
}) => {
  const transI18n = useI18n();

  const scenarioOptions = [
    { label: transI18n('home.roomType_1v1'), value: '1v1' },
    { label: transI18n('home.roomType_interactiveSmallClass'), value: 'mid-class' },
    { label: transI18n('home.roomType_interactiveBigClass'), value: 'big-class' },
  ];
  if (isVocational) {
    scenarioOptions.push({
      label: transI18n('home.roomType_vocationalClass'),
      value: 'vocational-class',
    });
  }
  const roleOptions = [
    { label: transI18n('home.role_teacher'), value: 'teacher' },
    { label: transI18n('home.role_student'), value: 'student' },
    { label: transI18n('home.role_assistant'), value: 'assistant' },
    { label: transI18n('home.role_audience'), value: 'incognito' },
    // { label: transI18n('home.role_observer'), value: 'observer' },
  ];
  const serviceOptions = [
    { label: transI18n('home.serviceType_premium'), value: 'premium-service' },
    { label: transI18n('home.serviceType_standard'), value: 'standard-service' },
    { label: transI18n('home.serviceType_latency'), value: 'latency-service' },
    { label: transI18n('home.serviceType_mix'), value: 'mix-service' },
  ];

  if (showServiceOptions) {
    serviceOptions.push(
      { label: transI18n('home.serviceType_mix_stream_cdn'), value: 'mix-stream-cdn-service' },
      { label: transI18n('home.serviceType_hosting_scene'), value: 'hosting-scene' },
    );
  }

  const languageOptions = [
    { label: '中文', value: 'zh' },
    { label: 'English', value: 'en' },
  ];
  const regionOptions = [
    { label: 'NA', value: 'NA' },
    { label: 'AP', value: 'AP' },
    { label: 'CN', value: 'CN' },
    { label: 'EU', value: 'EU' },
  ];
  const encryptionModeOptions = [
    { label: 'none', value: 0 },
    { label: 'aes-128-xts', value: 1 },
    { label: 'aes-128-ecb', value: 2 },
    { label: 'aes-256-xts', value: 3 },
    { label: 'sm4-128-ecb', value: 4 },
    { label: 'aes-128-gcm', value: 5 },
    { label: 'aes-256-gcm', value: 6 },
  ];

  const privacyEnUrl = 'https://www.agora.io/en/privacy-policy/';

  const privacyCnUrl = 'https://www.agora.io/cn/privacy-policy/';

  const signupCnUrl = 'https://sso.agora.io/cn/signup';

  const signupEnUrl = 'https://sso.agora.io/en/signup';

  const roomNameReg = /^[a-zA-Z0-9]{6,50}$/;
  const userNameReg = /^[\u4e00-\u9fa5a-zA-Z0-9\s]{3,50}$/;
  return (
    <Layout className={isVocational ? 'home-page home-vocational' : 'home-page'} direction="col">
      <Header className="home-page-header">
        <div className="header-left">
          <div className="header-left-logo"></div>
          <div className="header-left-title">{transI18n('home.header-left-title')}</div>
        </div>
        <div className="header-right">{headerRight}</div>
      </Header>

      <div
        className={classnames({
          'entry-room-loading-wrapper': 1,
          'show-loading': loading,
        })}>
        <Card height={90} width={90}>
          <div className="entry-room-loading"></div>
        </Card>
      </div>
      <Layout
        style={{
          boxShadow: '0px 6px 18px 0px rgba(47, 65, 146, 0.12)',
          background: '#fff',
          width: 760,
        }}
        className="facade"
        direction="row">
        <Table className="w-5 home-bg"></Table>
        <Table className="home-form">
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
                rule={roomNameReg}
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
                rule={userNameReg}
                errorMsg={transI18n('home.input-username-error-msg')}
                maxLength={50}
              />
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <Select
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
                    onChangeService && onChangeService(value);
                  }}
                  placeholder={transI18n('home.serviceType_placeholder')}></Select>
              </Col>
            </Row>
          ) : (
            <></>
          )}
          <Row className="home-row-item">
            <Col>
              <Select
                prefix={
                  <span className="home-label" title={transI18n('home.role')}>
                    {transI18n('home.role')}
                  </span>
                }
                id="role"
                value={role}
                onChange={(value) => {
                  onChangeRole(value);
                }}
                placeholder={transI18n('home.role_placeholder')}
                isMenuTextCenter={true}
                options={roleOptions}></Select>
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <Input
                disabled
                inputPrefixWidth={55}
                prefix={
                  <span className="home-label" title={transI18n('home.duration')}>
                    {transI18n('home.duration')}
                  </span>
                }
                id="duration"
                className="block w-full"
                value={duration + transI18n('home.duration_unit')}
                onChange={(evt) => onChangeDuration(+evt.currentTarget.value)}
                placeholder=""
              />
            </Col>
          </Row>

          <Button
            id="btn_join"
            className="mt-4"
            type="primary"
            size="lg"
            onClick={onClick}
            disabled={
              !(
                !!userId &&
                !!roomId &&
                !!userName.trim() &&
                !!roomName &&
                !!role &&
                !!scenario &&
                roomNameReg.test(roomName) &&
                userNameReg.test(userName) &&
                (scenario === 'vocational-class' ? !!service : true)
              )
            }>
            {transI18n('home.enter_classroom')}
          </Button>
          <Row className="text-center home-align-center">Version: Flexible Classroom_{version}</Row>
        </Table>
      </Layout>
      {restProps.children}
    </Layout>
  );
};
