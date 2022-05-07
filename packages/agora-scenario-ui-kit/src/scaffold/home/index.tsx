import React, { useState } from 'react';
import { Button } from '~components/button';
import { Layout, Header } from '~components/layout';
import { Input } from '~components/input';
import { Select } from '~components/select';
import { Col, Row, Table } from '~components/table';
import { transI18n } from '~components/i18n';
import './index.css';
import { HomeModule } from '~utilities/types';
import { Modal } from '~components/modal';
import { HomeAbout, Disclaimer } from '~components/home-about';
import { Card } from '~ui-kit';
import classnames from 'classnames';

export interface HomeAttributes {
  roomId: string;
  userId: string;
  userName: string;
  roomName: string;
  role: string;
  scenario: string;
  duration: number;
  language: string;
  region: string;
  debug: boolean;
  encryptionMode: string;
  encryptionKey: string;
}

export interface HomeProps extends HomeModule<HomeAttributes> {
  onClick: () => void | Promise<void>;
  version: string;
  SDKVersion: string;
  buildTime: string;
  commitID: string;
  loading: boolean;
  children?: React.ReactNode;
}

export const Home: React.FC<HomeProps> = ({
  roomId,
  userId,
  userName,
  roomName,
  role,
  scenario,
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
  onChangeLanguage,
  onChangeDuration,
  onChangeRegion,
  onChangeRoomId,
  onChangeUserId,
  onChangeUserName,
  onChangeRoomName,
  onChangeDebug,
  onClick,
  ...restProps
}) => {
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);
  const scenarioOptions = [
    { label: transI18n('home.roomType_1v1'), value: '1v1' },
    { label: transI18n('home.roomType_interactiveSmallClass'), value: 'mid-class' },
    { label: transI18n('home.roomType_interactiveBigClass'), value: 'big-class' },
  ];
  const roleOptions = [
    { label: transI18n('home.role_teacher'), value: 'teacher' },
    { label: transI18n('home.role_student'), value: 'student' },
    { label: transI18n('home.role_assistant'), value: 'assistant' },
    { label: transI18n('home.role_audience'), value: 'incognito' },
    // { label: transI18n('home.role_observer'), value: 'observer' },
  ];
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
    <Layout className="home-page" direction="col">
      <Header className="home-page-header">
        <div className="header-left">
          <div className="header-left-logo"></div>
          <div className="header-left-title">{transI18n('home.header-left-title')}</div>
        </div>
        <div className="header-right">
          {/* <Link
            className="header-right-item"
            to={`/recordation-search/${Buffer.from(
              `{"language":"${language}", "region":"${region}"}`,
            ).toString('base64')}`}>
            {transI18n('home.recordation-search')}
          </Link> */}
          <div
            style={{
              marginRight: language === 'en' ? -12 : -58,
              width: 131,
              position: 'relative',
              zIndex: 9,
            }}
            className={[language === 'en' ? 'region-en-div' : 'region-zh-div'].join(' ')}>
            <Select
              prefix={
                <span id="et_region" className="home-label">
                  {transI18n('home.region')}
                </span>
              }
              id="region"
              value={region}
              onChange={(value) => {
                onChangeRegion(value);
              }}
              placeholder={transI18n('home.region_placeholder')}
              options={regionOptions}
              // defaultMenuIsOpen={true}
            ></Select>
          </div>
          <div
            style={{ marginRight: 17, width: 185 }}
            className={[language === 'en' ? 'language-en-div' : 'language-zh-div'].join(' ')}>
            <Select
              prefix={<span className="home-label">{transI18n('home.language')}</span>}
              id="language"
              value={language}
              onChange={(value) => {
                onChangeLanguage(value);
              }}
              placeholder={transI18n('home.language_placeholder')}
              options={languageOptions}
              // defaultMenuIsOpen={true}
            ></Select>
          </div>
          <div
            className="header-right-about"
            onClick={() => {
              setShowAbout(true);
            }}>
            {transI18n('home.about')}
          </div>
        </div>
      </Header>
      {showAbout ? (
        <Modal
          title={transI18n('home.about')}
          style={{ width: 366 }}
          onCancel={() => {
            setShowAbout(false);
          }}
          closable={true}>
          <HomeAbout
            onLookDeclare={() => {
              setShowAbout(false);
              setShowDisclaimer(true);
            }}
            onLookPrivate={() => {
              const url = language === 'en' ? privacyEnUrl : privacyCnUrl;
              window.open(url);
            }}
            onRegiste={() => {
              const url = language === 'en' ? signupEnUrl : signupCnUrl;
              window.open(url);
            }}
            version={version}
            SDKVersion={SDKVersion}
            buildTime={buildTime}
            classroomVersion={version}
            commitID={commitID}
          />
        </Modal>
      ) : null}
      {showDisclaimer ? (
        <Modal
          style={{ height: language === 'en' ? 475 : 370, width: 560 }}
          title={transI18n('disclaimer.title')}
          modalType="back"
          onCancel={() => {
            setShowAbout(true);
            setShowDisclaimer(false);
          }}>
          <Disclaimer />
        </Modal>
      ) : null}
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
          {/* <Row className="home-row-item">
            <Col>
              <Select
                prefix={
                  <span className="home-label" title={transI18n('home.encryptionMode')}>
                    {transI18n('home.encryptionMode')}
                  </span>
                }
                id="encryptionMode"
                value={encryptionMode}
                onChange={(value) => {
                  onChangeEncryptionMode(value);
                }}
                placeholder={transI18n('home.encryptionMode_placeholder')}
                maxMenuHeight={120}
                options={encryptionModeOptions}></Select>
            </Col>
          </Row>
          <Row className="home-row-item can-error-item">
            <Col>
              <Input
                inputPrefixWidth={55}
                prefix={
                  <span
                    id="et_room_name"
                    className="home-label"
                    title={transI18n('home.encryptionKey')}>
                    {transI18n('home.encryptionKey')}
                  </span>
                }
                id="encryptionKey"
                type="text"
                className="block w-full"
                value={encryptionKey}
                onChange={(evt) => onChangeEncryptionKey(evt.currentTarget.value)}
                placeholder={transI18n('home.encryptionKey_placeholder')}
                // rule={/^[a-zA-Z0-9]{1,20}$/}
                // errorMsg={transI18n('home.input-error-msg')}
                errorMsgPositionLeft={75}
                maxLength={20}
              />
            </Col>
          </Row> */}
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
              {/* <DatePicker className="home-datepicker" onChangeDate={onChangeStartDate}/> */}
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
                userNameReg.test(userName)
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
