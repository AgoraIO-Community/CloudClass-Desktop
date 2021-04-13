import React, { FC, ReactNode, useCallback } from 'react';
import { t, transI18n } from '~components/i18n';
import { Icon } from '~components/icon';
import { ModalProps } from '~components/modal';
import { Table, TableHeader, Row, Col } from '~components/table';
import { defaultColumns } from './default-columns';
import Draggable from 'react-draggable';
import './index.css';

export { defaultColumns } from './default-columns';

export type ActionTypes =
  | 'podium'
  | 'whiteboard'
  | 'camera'
  | 'mic'
  | 'kick-out'
  | string;

export enum MediaDeviceState {
  not_available = 0,
  available = 1
}

type ColumnKey = 
  | 'name' 
  | 'onPodium' 
  | 'whiteboardGranted' 
  | 'cameraEnabled' 
  | 'micEnabled' 
  | 'stars' 
  | 'kickOut'

export interface Profile {
  uid: string | number;
  name: string;
  onPodium: boolean;
  canCoVideo: boolean;
  whiteboardGranted: boolean;
  canGrantBoard: boolean;
  cameraEnabled: boolean;
  micEnabled: boolean;
  cameraDevice: boolean;
  micDevice: boolean;
  stars: number;
  onlineState: boolean;
}

export interface Column {
  key: ColumnKey;
  name: string;
  action?: ActionTypes;
  visibleRoles?: string[];
  render?: (text: string, profile: Profile, hover: boolean, userType?: string) => ReactNode;
}

type ProfileRole = 'student' | 'teacher' | 'assistant' | 'invisible'
export interface RosterProps extends ModalProps {
  isDraggable?: boolean;
  /**
   * 老师姓名
   */
  teacherName: string;
  /**
   * 表头有默认值
   */
  columns?: Column[];
  /**
   * 数据源
   */
  dataSource?: Profile[];
  /**
   * 自己的userUuid
   */
  localUserUuid: string;
  /**
   * 当前用户角色
   */
  role: ProfileRole;
  /**
   * 老师端或学生端人员列表标记
   */
  userType?: 'teacher' | 'student';
  /**
   * col 点击的回调，是否可以点击，取决于 column 中配置 action 与否和 dataSource 数据中配置 canTriggerAction
   */
  onClick?: (action: ActionTypes, uid: string | number) => void;
  /**
   * onClose
   */
  onClose?: () => void;
}

const canOperate = (role: ProfileRole, localUid: string, data: Profile, col: Column): boolean => {
  if (['assistant', 'teacher'].includes(role)) {
    return true
  }

  if (role === 'student' && localUid === data.uid) {
    // only onPodium is true, student can control self media device
    if (data.onPodium && ['micEnabled', 'cameraEnabled'].includes(col.key)) {
      return true
    }
    return false
  }

  return false
}

const canHover = (role: ProfileRole, localUid: string, data: Profile, col: Column): boolean => {
  if (['assistant', 'teacher'].includes(role)) {
    return true
  }
  if (role === 'student' && localUid === data.uid) {
    if (data.onPodium && ['micEnabled', 'cameraEnabled'].includes(col.key)) {
      return true
    }
    return false
  }
  return false
}

export const Roster: FC<RosterProps> = ({
  teacherName,
  columns = defaultColumns,
  dataSource,
  onClick,
  onClose = () => console.log("onClose"),
  role,
  localUserUuid,
  title,
  isDraggable = true,
  userType = 'teacher'
}) => {
  const cols = columns.filter(({visibleRoles = []}: Column) => visibleRoles.length === 0 || visibleRoles.includes(role))

  const DraggableContainer = useCallback(({children}: {children: React.ReactChild}) => {
    return isDraggable ? <Draggable>{children}</Draggable> : <>{children}</>
  }, [isDraggable])

  return (
    <DraggableContainer>
      <div className="agora-board-resources roster-wrap">
        <div className="btn-pin">
          <Icon type="close" style={{ cursor: 'pointer' }} hover onClick={() => {
            onClose()
          }}></Icon>
        </div>
        <div className="main-title">
          {title ?? transI18n('roster.user_list')}
        </div>
        <div>
          <div className="roster-header">
            <label>{t('roster.teacher_name')}</label>
            <span className="roster-username">{teacherName}</span>
          </div>
          <Table className="roster-table">
            <TableHeader>
              {cols.map((col) => (
                <Col key={col.key}>{transI18n(col.name)}</Col>
              ))}
            </TableHeader>
            <Table className="table-container">
              {dataSource?.map((data: Profile) => (
                <Row className={'border-bottom-width-1'} key={data.uid}>
                  {cols.map((col: Column, idx: number) => (
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
                          ? col.render((data as any)[col.key], data, canHover(role, localUserUuid, data, col), userType)
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
  );
};
