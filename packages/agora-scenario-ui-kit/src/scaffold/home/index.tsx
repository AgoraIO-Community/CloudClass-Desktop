import React from 'react'
import { Button } from '~components/button'
import { Layout } from '~components/layout'
import { Select } from '~components/select'
import { Col, Row, Table } from '~components/table'
import { DatePicker } from '~components/date-picker'
import './index.css'

const {Option}: any = Select

export interface HomeProps {
  roomId: string,
  userId: string,
  userName: string,
  roomName: string,
  role: string,
  scenario: string,
  duration: number,
  version: string,
  onChangeRole: (value: any) => void,
  onChangeScenario: (value: any) => void,
  onChangeText: (type: string, value: string) => void,
  onChangeStartDate: (date: Date) => void,
  onChangeDuration: (value: number) => void,
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
  onChangeRole,
  onChangeScenario,
  onChangeText,
  onChangeStartDate,
  onChangeDuration,
  onClick
}: HomeProps) => {

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
              <input id="roomId" type="text" className="block w-full" value={roomId} onChange={(evt) => onChangeText('roomId', evt.currentTarget.value)} placeholder="请输入roomId" />
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <label htmlFor="userId">
                <span>userId</span>
              </label>
            </Col>
            <Col>
              <input id="userId" type="text" className="block w-full" value={userId} onChange={(evt) => onChangeText('userId', evt.currentTarget.value)} placeholder="请输入userId" />
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <label htmlFor="roomName">
                <span>房间</span>
              </label>
            </Col>
            <Col>
              <input id="roomName" type="text" className="block w-full" value={roomName} onChange={(evt) => onChangeText('roomName', evt.currentTarget.value)} placeholder="请输入房间名" />
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <label htmlFor="userName">
                <span>昵称</span>
              </label>
            </Col>
            <Col>
              <input id="userName" type="text" className="block w-full" value={userName} onChange={(evt) => onChangeText('userName', evt.currentTarget.value)} placeholder="请输入昵称" />
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <label htmlFor="userName">
                <span>类型</span>
              </label>
            </Col>
            <Col>
              <Select id="scenario" value={scenario || undefined} onChange={onChangeScenario} placeholder={'请选择课堂类型'}>
                <Option value="1v1">1v1</Option>
                <Option value="mid-class">中班课</Option>
              </Select>
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <label htmlFor="role">
                <span>角色</span>
              </label>
            </Col>
            <Col>
              <Select id="role" value={role || undefined} onChange={onChangeRole} placeholder={'请选择你的角色'}>
                <Option value="teacher">老师</Option>
                <Option value="student">学生</Option>
                <Option value="assistant">助教</Option>
                <Option value="incognito">观众</Option>
              </Select>
            </Col>
          </Row>
          <Row className="home-row-item">
            <Col>
              <label htmlFor="duration">
                <span>时间</span>
              </label>
            </Col>
            <Col>
            <input id="duration" type="number" className="block w-full" value={duration} onChange={(evt) => onChangeDuration(+evt.currentTarget.value)} placeholder="" />
              {/* <DatePicker className="home-datepicker" onChangeDate={onChangeStartDate}/> */}
            </Col>
          </Row>
          <Button className="mt-4" type="primary" size="lg" onClick={onClick}>创建教室</Button>
          <Row className="text-center">
            version: {version}
          </Row>
        </Table>
      </Layout>
    </Layout>
  )
}