import { t, transI18n } from '~components/i18n'
import { ActionTypes } from '~components/roster'
import classnames from 'classnames'
import React, { ReactNode, useCallback } from 'react'
import Draggable from 'react-draggable'
import { Col, Row, Table, TableHeader } from '~components/table'
import { Search } from '~components/input'
import SearchSvg from '~components/icon/assets/svg/search.svg'
import PodiumSvg from '~components/icon/assets/svg/podium.svg'
import { canOperate, getCameraState, getChatState, getMicrophoneState, ProfileRole, studentListSort } from './base'
import { getMediaIconProps, Icon, MediaIcon } from '~components/icon';

export type StudentRosterColumn = {
  key: StudentRosterColumnKey;
  name: string;
  action?: ActionTypes;
  visibleRoles?: string[];
  // render?: (text: string, profile: StudentRosterProfile, hover: boolean, userType?: string) => ReactNode;
  render?: (text: string, profile: StudentRosterProfile, hover: boolean, userType: string, onClick: any) => ReactNode;
}

export interface StudentRosterProfile {
  uid: string | number;
  name: string;
  cameraEnabled: boolean;
  micEnabled: boolean;
  cameraDevice: boolean;
  micDevice: boolean;
  onPodium: boolean;
  online: boolean;
  userType: string;
  hasStream: boolean;
  isLocal: boolean;
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
    render: (_, profile, hover, userType, onClick) => {
      const {
        cameraEnabled,
        cameraDevice,
        online,
        onPodium,
        hasStream,
        isLocal,
        uid,
      } = profile
      return (
        <MediaIcon
          {...getMediaIconProps({
            muted: !!cameraEnabled,
            deviceState: cameraDevice,
            online: !!online,
            onPodium: !!onPodium,
            userType: userType,
            hasStream: !!hasStream,
            isLocal: isLocal,
            uid: uid,
            type: 'camera',
          })}
          onClick={() => onClick && onClick('camera', uid)}
        />
      )
    },
  },
  {
    key: 'micEnabled',
    name: 'student.microphone',
    action: 'mic',
    render: (_, profile, hover, userType, onClick) => {
      const {
        micEnabled,
        micDevice,
        online,
        onPodium,
        hasStream,
        isLocal,
        uid,
      } = profile
      return (
        <MediaIcon
          {...getMediaIconProps({
            muted: !!micEnabled,
            deviceState: micDevice,
            online: !!online,
            onPodium: onPodium,
            userType: userType,
            hasStream: !!hasStream,
            isLocal: isLocal,
            uid: uid,
            type: 'microphone',
          })}
          onClick={() => onClick && onClick('mic', uid)}
        />
      )
    },
  },
  {
    key: 'chat',
    name: 'roster.chat',
    action: 'chat',
    render: (_, profile, canOperate, userType, onClick) => {
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
        <div className={cls} onClick={onClick}>
          <i className={chatStatus}></i>
        </div>
      )
    },
  },
  {
    key: 'kickOut',
    name: 'student.operation',
    action: 'kickOut',
    visibleRoles: ['teacher'],
    // FIXME: 不能点击时的样式
    render: (_, profile, hover, userType, onClick) => {
      const {
        uid
      } = profile
      return (
        <span className="kick-out" onClick={onClick}>
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
  // userType,
  userType = 'student',
  onClose = () => console.log('onClose'),
  onClick,
  onChange
}) => {

  const studentList = studentListSort(dataSource)

  const cols = columns.filter(({visibleRoles = []}: any) => visibleRoles.length === 0 || visibleRoles.includes(userType))

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
                      {idx === 0 ? 
                        <span
                          title={data[col.key]}
                          className={
                            `${idx === 0 ? 'roster-username' : ''} ${canOperate(userType, localUserUuid, data, col) ? 'action' : ''}`
                          }
                          style={{
                            paddingLeft: idx !== 0 ? 0 : 25
                          }}
                        >
                          {col.render
                            ? col.render((data as any)[col.key], data, canOperate(userType, localUserUuid, data, col), userType as any, (canOperate(userType, localUserUuid, data, col)
                            ? () =>
                                col.action &&
                                onClick &&
                                onClick(col.action, data.uid)
                            : undefined))
                            : (data as any)[col.key]}
                        </span> :
                        <span
                          style={{
                            paddingLeft: 0
                          }}
                        >
                          {col.render
                          ? col.render((data as any)[col.key], data, canOperate(userType, localUserUuid, data, col), userType as any, (canOperate(userType, localUserUuid, data, col)
                          ? () =>
                              col.action &&
                              onClick &&
                              onClick(col.action, data.uid)
                          : undefined))
                          : (data as any)[col.key]}
                        </span>
                      }
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