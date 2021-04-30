import React, { useState } from 'react'
import { Button } from '~components/button'
import { Layout, Header } from '~components/layout'
import { Input } from '~components/input'
import { Select } from '~components/select'
import { Col, Row, Table } from '~components/table'
import { t, transI18n } from '~components/i18n'
import './index.css'
import { HomeModule } from '~utilities/types'
import { Modal } from '~components/modal'
import { HomeAbout, Disclaimer } from '~components/home-about'

export interface HomeAttributes {
  roomId: string,
  userId: string,
  userName: string,
  roomName: string,
  role: string,
  scenario: string,
  duration: number,
  language: string,
  region: string,
  debug: boolean;
}

export interface HomeProps extends HomeModule<HomeAttributes> {
  onClick: () => void | Promise<void>;
  version: string;
  SDKVersion: string;
  publishDate: string;
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
  publishDate,
  language,
  region,
  debug = false,
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
  onClick
}) => {
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);
  const scenarioOptions = [
    { label: t('home.roomType_1v1'), value: '1v1' },
    { label: t('home.roomType_interactiveSmallClass'), value: 'mid-class' },
    { label: t('home.roomType_interactiveBigClass'), value: 'big-class' },
  ]
  const roleOptions = [
    { label: t('home.role_teacher'), value: 'teacher' },
    { label: t('home.role_student'), value: 'student' },
    { label: t('home.role_assistant'), value: 'assistant' },
    { label: t('home.role_audience'), value: 'incognito' },
  ]
  const languageOptions = [
    { label: '中文', value: 'zh' },
    { label: 'English', value: 'en' },
  ]
  const regionOptions = [
    { label: 'NA', value: 'NS' },
    { label: 'AP', value: 'AP' },
    { label: 'CN', value: 'CN' },
    { label: 'EU', value: 'EU' },
  ]

  const privacyEnUrl = "https://www.agora.io/en/privacy-policy/";

  const privacyCnUrl = "https://www.agora.io/cn/privacy-policy/";

  const signupCnUrl = "https://sso.agora.io/cn/signup";

  const signupEnUrl = "https://sso.agora.io/en/signup";

  return (
    <Layout className={debug ? "home-page debug" : "home-page"} direction="col">
      <Header className="home-page-header">
        <div className="header-left">
          <div className="header-left-logo"></div>
          <div className="header-left-title">{transI18n('home.header-left-title')}</div>
        </div>
        <div className="header-right">
          <div style={{ marginRight: language === 'en' ? -12 : -58, width: 131, position: 'relative', zIndex: 9 }} className={[language === 'en' ? "region-en-div" : "region-zh-div"].join(" ")}>
            <Select
              prefix={<span className="home-label">{transI18n('home.region')}</span>}
              id="region"
              value={region}
              onChange={value => {
                onChangeRegion(value)
              }}
              placeholder={transI18n('home.region_placeholder')}
              options={regionOptions}
              // defaultMenuIsOpen={true}
            >
            </Select>
          </div>
          <div style={{ marginRight: 17, width: 185 }} className={[language === 'en' ? "language-en-div" : "language-zh-div"].join(" ")}>
            <Select
              prefix={<span className="home-label">{transI18n('home.language')}</span>}
              id="language"
              value={language}
              onChange={value => {
                onChangeLanguage(value)
              }}
              placeholder={transI18n('home.language_placeholder')}
              options={languageOptions}
              // defaultMenuIsOpen={true}
            >
            </Select>
          </div>
          <div
            className="header-right-about"
            onClick={() => {
              setShowAbout(true)
            }}
          >{transI18n('home.about')}</div>
        </div>
      </Header>
      {showAbout ? (
        <Modal
          title={transI18n('home.about')}
          width={366}
          onCancel={() => {
            setShowAbout(false)
          }}
        >
          <HomeAbout 
            onLookDeclare={() => {
              setShowAbout(false)
              setShowDisclaimer(true)
            }}
            onLookPrivate={() => {
              const url = language === 'en' ? privacyEnUrl : privacyCnUrl
              window.open(url)
            }}
            onRegiste={() => {
              const url = language === 'en' ? signupEnUrl : signupCnUrl
              window.open(url)
            }}
            version={version}
            SDKVersion={SDKVersion}
            publishDate={publishDate}
            classroomVersion={version}
          />
        </Modal>
      ) : null}
      {showDisclaimer ? (
        <Modal
          width={560}
          style={{height: language === 'en' ? 475 : 370}}
          title={transI18n('disclaimer.title')}
          modalType="back"
          onCancel={() => {
            setShowAbout(true)
            setShowDisclaimer(false)
          }}
        >
          <Disclaimer />
        </Modal>
      ) : null}
      <Layout style={{ boxShadow: '0px 6px 18px 0px rgba(47, 65, 146, 0.12)', background: '#fff', width: 760 }} className="facade" direction="row">
        <Table className="w-5 home-bg"></Table>
        <Table className="home-form">
          {/* <div className="form-title">{transI18n('home.form_title')}</div> */}
          {debug ?
            <Row className="home-row-item">
              <Col>
                <Input inputPrefixWidth={language === 'en' ? 70 : 75} prefix={<span title="RoomId">RoomId</span>} id="roomId" type="text" className="block w-full" value={roomId} onChange={(evt) => onChangeRoomId(evt.currentTarget.value)} placeholder={transI18n('home.roomId_placeholder')} />
              </Col>
            </Row>
            : <></>}
          {debug ?
            <Row className="home-row-item">
              <Col>
                <Input inputPrefixWidth={language === 'en' ? 70 : 75} prefix={<span title="UserId">UserId</span>} id="userId" type="text" className="block w-full" value={userId} onChange={(evt) => onChangeUserId(evt.currentTarget.value)} placeholder={transI18n('home.userId_placeholder')} />
              </Col>
            </Row>
            : <></>}
          <Row className="home-row-item can-error-item">
            <Col>
              <Input 
                inputPrefixWidth={55} 
                prefix={<span className="home-label" title={transI18n('home.roomName')}>{transI18n('home.roomName')}</span>} 
                id="roomName" 
                type="text" 
                className="block w-full" 
                value={roomName} 
                onChange={(evt) => onChangeRoomName(evt.currentTarget.value)} 
                placeholder={transI18n('home.roomName_placeholder')}
                rule={/^[a-zA-Z0-9]{1,20}$/}
                errorMsg={transI18n('home.input-error-msg')}
                errorMsgPositionLeft={75} 
                maxLength={20}
              />
            </Col>
          </Row>
          <Row className="home-row-item can-error-item">
            <Col>
              <Input 
                inputPrefixWidth={55} 
                prefix={<span className="home-label" title={transI18n('home.nickName')}>{transI18n('home.nickName')}</span>} 
                id="userName" 
                type="text" 
                className="block w-full" 
                value={userName} 
                onChange={(evt) => onChangeUserName(evt.currentTarget.value)} 
                placeholder={transI18n('home.nickName_placeholder')} 
                rule={/^[a-zA-Z0-9]{1,20}$/}
                errorMsg={transI18n('home.input-error-msg')}
                errorMsgPositionLeft={75}
                maxLength={20}
              />
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <Select
                prefix={<span className="home-label" title={transI18n('home.roomType')}>{transI18n('home.roomType')}</span>}
                id="scenario"
                value={scenario}
                options={scenarioOptions}
                onChange={value => {
                  onChangeScenario(value)
                }}
                placeholder={transI18n('home.roomType_placeholder')}
              >
              </Select>
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <Select
                prefix={<span className="home-label" title={transI18n('home.role')}>{transI18n('home.role')}</span>}
                id="role"
                value={role}
                onChange={value => {
                  onChangeRole(value)
                }}
                placeholder={transI18n('home.role_placeholder')}
                options={roleOptions}
              >

              </Select>
            </Col>
          </Row>
          {debug ?
            <Row className="home-row-item">
              <Col>
                <Select
                  prefix={<span title={transI18n('home.language')}>{transI18n('home.language')}</span>}
                  id="language"
                  value={language}
                  onChange={value => {
                    onChangeLanguage(value)
                  }}
                  placeholder={transI18n('home.language_placeholder')}
                  options={languageOptions}
                >

                </Select>
              </Col>
            </Row>
            : <></>}
          {debug ?
            <Row className="home-row-item">
              <Col>
                <Select
                  prefix={<span title={transI18n('home.region')}>{transI18n('home.region')}</span>}
                  id="region"
                  value={region}
                  onChange={value => {
                    onChangeRegion(value)
                  }}
                  placeholder={transI18n('home.region_placeholder')}
                  options={regionOptions}
                >
                </Select>
              </Col>
            </Row>
            : <></>}
          
            <Row className="home-row-item">
              <Col>
                <Input disabled inputPrefixWidth={55} prefix={<span className="home-label" title={transI18n('home.duration')}>{transI18n('home.duration')}</span>} id="duration" className="block w-full" value={duration + transI18n('home.duration_unit')} onChange={(evt) => onChangeDuration(+evt.currentTarget.value)} placeholder="" />
                {/* <DatePicker className="home-datepicker" onChangeDate={onChangeStartDate}/> */}
              </Col>
            </Row>
            
          <Button className="mt-4" type="primary" size="lg" onClick={onClick} disabled={!(!!userId && !!roomId && !!userName && !!roomName && !!role && !!scenario && /^[a-zA-Z0-9]{1,20}$/.test(roomName) && /^[a-zA-Z0-9]{1,20}$/.test(userName))}>{transI18n('home.enter_classroom')}</Button>
          <Row className="text-center home-align-center">
            <div onClick={() => {
              return;
              onChangeDebug(!debug)
            }}>
              Version: Flexible Classroom_{version}
            </div>
          </Row>
        </Table>
      </Layout>
    </Layout>
  )
}