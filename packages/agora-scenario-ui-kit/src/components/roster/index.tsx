import React, { FC, ReactNode, useCallback } from 'react';
import { t, transI18n } from '~components/i18n';
import { Icon } from '~components/icon';
import { ModalProps } from '~components/modal';
import { Table, TableHeader, Row, Col } from '~components/table';
import { defaultColumns } from './default-columns';
import Draggable from 'react-draggable';
import './index.css';
import SearchSvg from '~components/icon/assets/svg/search.svg'
import { canOperate, ProfileRole, studentListSort } from './base';
import { Search } from '../input';

export * from './user-list';

export type ActionTypes =
  | 'podium'
  | 'whiteboard'
  | 'camera'
  | 'mic'
  | 'kickOut'
  | 'chat'
  | string;

export enum MediaDeviceState {
  not_available = 0,
  available = 1
}

export type ColumnKey = 
  | 'name' 
  | 'onPodium' 
  | 'whiteboardGranted' 
  | 'cameraEnabled' 
  | 'micEnabled' 
  | 'stars' 
  | 'chat'
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
  online: boolean;
  userType: string;
  hasStream: boolean;
  isLocal: boolean;
  // onlineState: boolean;
}

export interface Column {
  key: ColumnKey;
  name: string;
  action?: ActionTypes;
  visibleRoles?: string[];
  render?: (text: string, profile: Profile, canOperate: boolean, userType: string, onClick: any) => ReactNode;
}


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
  // /**
  //  * 当前用户角色
  //  */
  // userType: ProfileRole;
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
  onChange: (evt: any) => void;
}

export const Roster: FC<RosterProps> = ({
  teacherName,
  columns = defaultColumns,
  dataSource = [],
  onClick,
  onClose = () => console.log("onClose"),
  // userType,
  localUserUuid,
  title,
  isDraggable = true,
  userType = 'student',
  onChange
}) => {

  const studentList = studentListSort(dataSource)

  const cols = columns.filter(({visibleRoles = []}: Column) => visibleRoles.length === 0 || visibleRoles.includes(userType))

  const DraggableContainer = useCallback(({ children, cancel }: { children: React.ReactChild, cancel: string }) => {
    return isDraggable ? <Draggable cancel={cancel}>{children}</Draggable> : <>{children}</>
  }, [isDraggable])

  return (
    <DraggableContainer cancel={".search-header"} >
      <div className="agora-board-resources roster-wrap">
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
              {cols.map((col) => (
                <Col key={col.key} style={{justifyContent: 'center'}}>{transI18n(col.name)}</Col>
              ))}
            </TableHeader>
            <Table className="table-container">
              {studentList?.map((data: Profile) => (
                <Row className={'border-bottom-width-1'} key={data.uid}>
                  {cols.map((col: Column, idx: number) => (
                    <Col key={col.key} style={{justifyContent: idx !== 0 ? 'center' : 'flex-start'}}>
                      {idx === 0 ? 
                        <span
                          className={
                            `${idx === 0 ? 'roster-username' : ''}`
                          }
                          title = {(data as any)[col.key]}
                          style={{
                            paddingLeft: 25
                          }}
                          onClick={
                            canOperate(userType, localUserUuid, data, col)
                              ? () =>
                                  col.action &&
                                  onClick &&
                                  onClick(col.action, data.uid)
                              : undefined
                          }>
                          {(data as any)[col.key]}
                        </span>
                      : 
                          <span
                            style={{
                              paddingLeft: 0
                            }}
                          >
                            {col.render
                            ? col.render((data as any)[col.key], data, canOperate(userType, localUserUuid, data, col), userType, (canOperate(userType, localUserUuid, data, col)
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
  );
};
