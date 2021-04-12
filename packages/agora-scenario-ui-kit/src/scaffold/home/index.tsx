import React from 'react'
import { Button } from '~components/button'
import { Layout } from '~components/layout'
import { Select } from '~components/select'
import { Col, Row, Table } from '~components/table'
import { DatePicker } from '~components/date-picker'
import { t } from '~components/i18n'
import './index.css'
import { HomeModule, OnChangeEvents } from '~utilities/types'

const {Option}: any = Select

export interface HomeAttributes {
  roomId: string,
  userId: string,
  userName: string,
  roomName: string,
  role: string,
  scenario: string,
  duration: number,
  version: string,
  language: string,
}

export interface HomeProps extends HomeModule<HomeAttributes> {
  onClick: () => void | Promise<void>
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
  onChangeRole,
  onChangeScenario,
  onChangeLanguage,
  onChangeDuration,
  onChangeRoomId,
  onChangeUserId,
  onChangeUserName,
  onChangeRoomName,
  onClick
}) => {

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
              <Select id="scenario" value={scenario || undefined} onChange={onChangeScenario} placeholder={t('home.roomType_placeholder')}>
                <Option value="1v1">1v1</Option>
                <Option value="mid-class">{t('home.roomType_interactiveSmallClass')}</Option>
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
              <Select id="role" value={role || undefined} onChange={onChangeRole} placeholder={t('home.role_placeholder')}>
                <Option value="teacher">{t('home.role_teacher')}</Option>
                <Option value="student">{t('home.role_student')}</Option>
                <Option value="assistant">{t('home.role_assistant')}</Option>
                <Option value="incognito">{t('home.role_audience')}</Option>
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
              <Select id="language" value={language} onChange={onChangeLanguage} placeholder={t('home.language_placeholder')}>
                <Option value="zh">中文</Option>
                <Option value="en">English</Option>
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
          <Button className="mt-4" type="primary" size="lg" onClick={onClick}>{t('home.enter_classroom')}</Button>
          <Row className="text-center">
            version: {version}
          </Row>
        </Table>
      </Layout>
    </Layout>
  )
}