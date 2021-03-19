import React from 'react'
import { Button } from '~components/button'
import { Layout } from '~components/layout'
import { Select } from '~components/select'
import { Col, Row, Table } from '~components/table'
import './index.css'

const {Option}: any = Select

export interface HomeProps {
  roomId: string,
  userName: string,
  role: string,
  scenario: string,
  duration: number,
  version: string,
  onChangeRole: (value: any) => void,
  onChangeScenario: (value: any) => void,
  onChangeText: (type: string, value: string) => void,
  onChangeDuration: (value: number) => void,
  onClick: () => void | Promise<void>
}

export const Home: React.FC<HomeProps> = ({
  roomId,
  userName,
  role,
  scenario,
  duration,
  version,
  onChangeRole,
  onChangeScenario,
  onChangeText,
  onChangeDuration,
  onClick
}: HomeProps) => {

  return (
    <Layout className="home-page">
      <Layout className="facade" direction="row">
        <Table className="placeholder-gray-700 bg-gray-700 w-5"></Table>
        <Table className="home-form">
          <Row>
            <Col>
              <label htmlFor="roomId">
                <span className="text-gray-700">房间ID</span>
              </label>
            </Col>
            <Col>
              <input id="roomId" type="text" className="mt-1 block w-full" value={roomId} onChange={(evt) => onChangeText('roomId', evt.currentTarget.value)} placeholder="" />
            </Col>
          </Row>
          <Row>
            <Col>
              <label htmlFor="userName">
                <span className="text-gray-700">用户名</span>
              </label>
            </Col>
            <Col>
              <input id="userName" type="text" className="mt-1 block w-full" value={userName} onChange={(evt) => onChangeText('userName', evt.currentTarget.value)} placeholder="" />
            </Col>
          </Row>
          <Row>
            <Col>
              <label htmlFor="role">
                <span className="text-gray-700">角色</span>
              </label>
            </Col>
            <Col>
              <Select id="role" value={role} onChange={onChangeRole}>
                <Option value="teacher">老师</Option>
                <Option value="student">学生</Option>
                <Option value="assistant">助教</Option>
                <Option value="incognito">观众</Option>
              </Select>
            </Col>
          </Row>
          <Row>
            <Col>
              <label htmlFor="scenario">
                <span className="text-gray-700">场景</span>
              </label>
            </Col>
            <Col>
              <Select id="scenario" value={scenario} onChange={onChangeScenario}>
                <Option value="1v1">1v1</Option>
                <Option value="mid-class">中班课</Option>
              </Select>
            </Col>
          </Row>
          <Row>
            <Col>
              <label htmlFor="duration">
                <span className="text-gray-700">时间</span>
              </label>
            </Col>
            <Col>
            <input id="duration" type="number" className="mt-1 block w-full" value={duration} onChange={(evt) => onChangeDuration(+evt.currentTarget.value)} placeholder="" />
            </Col>
          </Row>
          <Button type="primary" size="lg" onClick={onClick}>创建教室</Button>
          <Row className="text-center">
            version: {version}
          </Row>
        </Table>
      </Layout>
    </Layout>
  )
}