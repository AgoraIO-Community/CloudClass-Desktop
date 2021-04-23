import { ActionTypes, Icon, t, transI18n } from '@/ui-kit'
import classnames from 'classnames'
import React, { ReactNode, useCallback } from 'react'
import Draggable from 'react-draggable'
import { Col, Row, Table, TableHeader } from '~components/table'
import { Search } from '~components/input'
import SearchSvg from '~components/icon/assets/svg/search.svg'
import { canOperate, getCameraState, getMicrophoneState, ProfileRole } from './base'

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
}

export type StudentRosterActionTypes =
  | 'camera'
  | 'mic'
  | 'kickOut'
  | string

export type StudentRosterColumnKey = 
  | 'camera'
  | 'mic'
  | 'kickOut'
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
  },
  {
    key: 'camera',
    name: 'student.camera',
    action: 'camera',
    render: (_, profile, hover) => {
      const {
        operateStatus,
        cameraStatus,
        type,
      } = getCameraState(profile, hover)

      const cls = classnames({
        [`${operateStatus}`]: 1,
        [`${cameraStatus}`]: 1,
        // [`disabled`]: profile.disabled
      })
      return (
        <span className="camera-enabled">
          <Icon
            iconhover={hover}
            className={cls}
            type={type}
          />
        </span>
      )
    },
  },
  {
    key: 'mic',
    name: 'student.microphone',
    action: 'mic',
    render: (_, profile, hover) => {
      const {
        operateStatus,
        microphoneStatus,
        type,
      } = getMicrophoneState(profile, hover)

      const cls = classnames({
        [`${operateStatus}`]: 1,
        [`${microphoneStatus}`]: 1,
        // [`disabled`]: profile.disabled
      })
      return (
        <span className="mic-enabled">
          <Icon
            iconhover={hover}
            className={cls}
            type={type}
          />
        </span>
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
  dataSource,
  columns = defaultStudentColumns,
  role,
  userType,
  onClose = () => console.log('onClose'),
  onClick,
  onChange
}) => {

  const cols = columns.filter(({visibleRoles = []}: any) => visibleRoles.length === 0 || visibleRoles.includes(role))

  const DraggableContainer = useCallback(({ children }: { children: React.ReactChild }) => {
    return isDraggable ? <Draggable>{children}</Draggable> : <>{children}</>
  }, [isDraggable])

  return (
    <DraggableContainer>
      <div className="agora-board-resources roster-user-list-wrap">
        <div className="btn-pin">
          <Icon type="close" style={{ cursor: 'pointer' }} hover onClick={() => {
            onClose()
          }}></Icon>
        </div>
        <div className="main-title">
          {title ?? transI18n('scaffold.user_list')}
        </div>
        <div>
          <div className="search-header roster-header">
            <div className="search-teacher-name">
              <label>{t('roster.teacher_name')}</label>
              <span className="roster-username">{teacherName}</span>
            </div>
            <Search
              onSearch={onChange}
              suffix={<img src={SearchSvg} />}
              placeholder={transI18n('scaffold.search')}
            />
          </div>
          <Table className="roster-table">
            <TableHeader>
              {cols.map((col: StudentRosterColumn) => (
                <Col key={col.key}>{transI18n(col.name)}</Col>
              ))}
            </TableHeader>
            <Table className="table-container">
              {dataSource?.map((data: StudentRosterProfile) => (
                <Row className={'border-bottom-width-1'} key={data.uid}>
                  {cols.map((col: StudentRosterColumn, idx: number) => (
                    <Col key={col.key}>
                      <span
                        className={
                          `${idx === 0 ? 'roster-username' : ''} ${canOperate(role, localUserUuid, data, col) ? 'action' : ''}`
                        }
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