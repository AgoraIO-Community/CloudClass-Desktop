import React from 'react'
import { Button } from '~components/button'
import { Layout } from '~components/layout'
import { Select } from '~components/select'
import { Col, Row, Table } from '~components/table'
import { DatePicker } from '~components/date-picker'
import { t } from '~components/i18n'
import './index.css'
import { HomeModule, OnChangeEvents } from '~utilities/types'

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
}

export interface HomeProps extends HomeModule<HomeAttributes> {
  onClick: () => void | Promise<void>;
  version: string;
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
  language,
  region,
  onChangeRole,
  onChangeScenario,
  onChangeLanguage,
  onChangeDuration,
  onChangeRegion,
  onChangeRoomId,
  onChangeUserId,
  onChangeUserName,
  onChangeRoomName,
  onClick
}) => {
  const scenarioOptions = [
    {label: '1v1', value: '1v1'},
    {label: t('home.roomType_interactiveSmallClass'), value: 'mid-class'},
  ]
  const roleOptions = [
    {label: t('home.role_teacher'), value: 'teacher'},
    {label: t('home.role_student'), value: 'student'},
    {label: t('home.role_assistant'), value: 'assistant'},
    {label: t('home.role_audience'), value: 'incognito'},
  ]
  const languageOptions = [
    {label: '中文', value: 'zh'},
    {label: 'English', value: 'en'},
  ]
  const regionOptions = [
    {label: 'NA', value: 'NS'},
    {label: 'AP', value: 'AP'},
    {label: 'CN', value: 'CN'},
    {label: 'EU', value: 'EU'},
  ]
  return (
    <Layout className="home-page">
      <Layout style={{boxShadow: '2px 2px 8px 1px rgb(0 0 0 / 10%)'}} className="facade" direction="row">
        <Table className="w-5 home-bg"></Table>
        <Table className="home-form">
          <Row className="home-row-item">
            <Col>
              <label htmlFor="roomId">
                <span>roomId</span>
              </label>
            </Col>
            <Col>
              <input id="roomId" type="text" className="block w-full" value={roomId} onChange={(evt) => onChangeRoomId(evt.currentTarget.value)} placeholder={t('home.roomId_placeholder')} />
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <label htmlFor="userId">
                <span>userId</span>
              </label>
            </Col>
            <Col>
              <input id="userId" type="text" className="block w-full" value={userId} onChange={(evt) => onChangeUserId(evt.currentTarget.value)} placeholder={t('home.userId_placeholder')} />
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <label htmlFor="roomName">
                <span>{t('home.roomName')}</span>
              </label>
            </Col>
            <Col>
              <input id="roomName" type="text" className="block w-full" value={roomName} onChange={(evt) => onChangeRoomName(evt.currentTarget.value)}  placeholder={t('home.roomName_placeholder')} />
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <label htmlFor="userName">
                <span>{t('home.nickName')}</span>
              </label>
            </Col>
            <Col>
              <input id="userName" type="text" className="block w-full" value={userName} onChange={(evt) => onChangeUserName(evt.currentTarget.value)}  placeholder={t('home.nickName_placeholder')} />
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <label htmlFor="userName">
                <span>{t('home.roomType')}</span>
              </label>
            </Col>
            <Col>
              <Select 
                id="scenario" 
                value={scenario}
                options={scenarioOptions} 
                onChange={value => {
                  onChangeScenario(value)
                }} 
                placeholder={t('home.roomType_placeholder')}
              >
              </Select>
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <label htmlFor="role">
                <span>{t('home.role')}</span>
              </label>
            </Col>
            <Col>
              <Select 
                id="role" 
                value={role} 
                onChange={value => {
                  onChangeRole(value)
                }} 
                placeholder={t('home.role_placeholder')}
                options={roleOptions}
              >
                
              </Select>
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <label htmlFor="language">
                <span>{t('home.language')}</span>
              </label>
            </Col>
            <Col>
              <Select 
                id="language" 
                value={language} 
                onChange={value => {
                  onChangeLanguage(value)
                }} 
                placeholder={t('home.language_placeholder')}
                options={languageOptions}
              >
                
              </Select>
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <label htmlFor="region">
                <span>{t('home.region')}</span>
              </label>
            </Col>
            <Col>
              <Select 
                id="region" 
                value={region} 
                onChange={value => {
                  onChangeRegion(value)
                }} 
                placeholder={t('home.region_placeholder')}
                options={regionOptions}
              >
              </Select>
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <label htmlFor="duration">
                <span>{t('home.duration')}</span>
              </label>
            </Col>
            <Col>
            <input id="duration" type="number" className="block w-full" value={duration} onChange={(evt) => onChangeDuration(+evt.currentTarget.value)} placeholder="" />
              {/* <DatePicker className="home-datepicker" onChangeDate={onChangeStartDate}/> */}
            </Col>
          </Row>
          <Button className="mt-4" type="primary" size="lg" onClick={onClick} disabled={!(!!userId && !!roomId && !!userName && !!roomName)}>{t('home.enter_classroom')}</Button>
          <Row className="text-center">
            version: {version}
          </Row>
        </Table>
      </Layout>
    </Layout>
  )
}