import { ActionTypes, Icon, t, transI18n } from '@/ui-kit'
import classnames from 'classnames'
import React, { ReactNode, useCallback } from 'react'
import Draggable from 'react-draggable'
import { Col, Row, Table, TableHeader } from '~components/table'
import { Search } from '~components/input'
import SearchSvg from '~components/icon/assets/svg/search.svg'
import PodiumSvg from '~components/icon/assets/svg/podium.svg'
import { canOperate, getCameraState, getChatState, getMicrophoneState, ProfileRole, studentListSort } from './base'

export type StudentRosterColumn = {
  key: StudentRosterColumnKey;
  name: string;
  action?: ActionTypes;
  visibleRoles?: string[];
  render?: (text: string, profile: StudentRosterProfile, hover: boolean, userType?: string) => ReactNode;
}

export interface StudentRosterProfile {
  uid: string | number;
  name: string;
  cameraEnabled: boolean;
  micEnabled: boolean;
  onPodium: boolean;
}

export type StudentRosterActionTypes =
  | 'cameraEnabled'
  | 'micEnabled'
  | 'kickOut'
  | 'chat'
  | string

export type StudentRosterColumnKey = 
  | 'cameraEnabled'
  | 'micEnabled'
  | 'kickOut'
  | 'chat'
  | 'name'

export type StudentRosterProps = {
  isDraggable: boolean;
  columns?: StudentRosterColumn[];
  title?: string;
  dataSource?: StudentRosterProfile[];
  teacherName: string;
  localUserUuid: string;
  role: ProfileRole;
  userType?: 'teacher' | 'student';
  onClick?: (action: StudentRosterActionTypes, uid: string | number) => void;
  onClose?: () => void;
  onChange: (evt: any) => void;
}

const defaultStudentColumns: StudentRosterColumn[] = [
  {
    key: 'name',
    name: 'student.student_name',
    render: (_, profile) => {
      return (
        <div className="student-username">
          <span title={profile.name}>{profile.name}</span>
          {profile.onPodium ? <img src={PodiumSvg} style={{marginLeft: 2}}/> : null}
        </div>
      )
    },
  },
  {
    key: 'cameraEnabled',
    name: 'student.camera',
    action: 'camera',
    render: (_, profile, canOperate) => {
      const {
        operateStatus,
        cameraStatus,
        type,
      } = getCameraState(profile, canOperate);
      const cls = classnames({
        [`${operateStatus}`]: 1,
        [`${cameraStatus}`]: 1,
      })
      return (
        <Icon type={type} className={cls} iconhover={canOperate}/>
      )
    },
  },
  {
    key: 'micEnabled',
    name: 'student.microphone',
    action: 'mic',
    render: (_, profile, canOperate) => {
      const {
        operateStatus,
        microphoneStatus,
        type,
      } = getMicrophoneState(profile, canOperate);
      const cls = classnames({
        [`${operateStatus}`]: 1,
        [`${microphoneStatus}`]: 1,
      })
      return (
        <Icon type={type} className={cls} iconhover={canOperate}/>
      )
    },
  },
  {
    key: 'chat',
    name: 'roster.chat',
    action: 'chat',
    render: (text: string, profile: any, canOperate) => {
      const {
        operateStatus,
        chatStatus,
        type,
      } = getChatState(profile, canOperate);
      const cls = classnames({
        ["icon-hover"]: canOperate,
        ["icon-disable"]: !canOperate,
        ["icon-flex"]: 1,
      })
      return (
        <div className={cls}>
          <i className={chatStatus}></i>
        </div>
      )
    },
  },
  {
    key: 'kickOut',
    name: 'student.operation',
    action: 'kickOut',
    visibleRoles: ['assistant', 'teacher'],
    // FIXME: 不能点击时的样式
    render: (_, profile, hover) => {
      return (
        <span className="kick-out">
          <Icon iconhover={hover} type="exit" />
        </span>
      )
    },
  }
]

export const StudentRoster: React.FC<StudentRosterProps> = ({
  isDraggable = true,
  title,
  teacherName,
  localUserUuid,
  dataSource = [],
  columns = defaultStudentColumns,
  role,
  userType,
  onClose = () => console.log('onClose'),
  onClick,
  onChange
}) => {

  const studentList = studentListSort(dataSource)

  const cols = columns.filter(({visibleRoles = []}: any) => visibleRoles.length === 0 || visibleRoles.includes(role))

  const DraggableContainer = useCallback(({ children, cancel }: { children: React.ReactChild, cancel: string }) => {
    return isDraggable ? <Draggable cancel={cancel}>{children}</Draggable> : <>{children}</>
  }, [isDraggable])

  return (
    <DraggableContainer cancel={".search-header"} >
      <div className="agora-board-resources roster-user-list-wrap">
        <div className="btn-pin">
          <Icon type="close" style={{ cursor: 'pointer' }} hover onClick={() => {
            onClose()
          }}></Icon>
        </div>
        <div className="main-title">
          {title ?? transI18n('roster.user_list')}
        </div>
        <div className="roster-container">
          <div className="search-header roster-header">
            <div className="search-teacher-name">
              <label>{t('roster.teacher_name')}</label>
              <span title={teacherName} className="roster-username">{teacherName}</span>
            </div>
            {
              userType === 'teacher' ?
              <Search
                onSearch={onChange}
                prefix={<img src={SearchSvg} />}
                inputPrefixWidth={32}
                placeholder={transI18n('scaffold.search')}
              /> : null
            }
          </div>
          <Table className="roster-table">
            <TableHeader>
              {cols.map((col: StudentRosterColumn) => (
                <Col key={col.key} style={{justifyContent: 'center'}}>{transI18n(col.name)}</Col>
              ))}
            </TableHeader>
            <Table className="table-container">
              {studentList?.map((data: StudentRosterProfile) => (
                <Row className={'border-bottom-width-1'} key={data.uid}>
                  {cols.map((col: StudentRosterColumn, idx: number) => (
                    <Col key={col.key} style={{justifyContent: idx !== 0 ? 'center' : 'flex-start'}}>
                      <span
                        title={col.name}
                        className={
                          `${idx === 0 ? 'roster-username' : ''} ${canOperate(role, localUserUuid, data, col) ? 'action' : ''}`
                        }
                        style={{
                          paddingLeft: idx !== 0 ? 0 : 25
                        }}
                        onClick={
                          canOperate(role, localUserUuid, data, col)
                            ? () =>
                              col.action &&
                              onClick &&
                              onClick(col.action, data.uid)
                            : undefined
                        }>
                        {col.render
                          ? col.render((data as any)[col.key], data, canOperate(role, localUserUuid, data, col), userType)
                          : (data as any)[col.key]}
                      </span>
                    </Col>
                  ))}
                </Row>
              ))}
            </Table>
          </Table>
        </div>
      </div>
    </DraggableContainer>
  )
}