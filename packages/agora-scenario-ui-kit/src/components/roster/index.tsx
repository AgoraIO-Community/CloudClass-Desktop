import React, { FC, ReactNode } from 'react';
import { t } from '~components/i18n';
import { Modal, ModalProps } from '~components/modal';
import { Table, TableHeader, Row, Col } from '~components/table';
import { defaultColumns } from './default-columns';
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
  disabled: boolean;
}

export interface Column {
  key: string;
  name: string;
  action?: ActionTypes;
  render?: (text: string, profile: Profile) => ReactNode;
}

export interface RosterProps extends ModalProps {
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
   * col 点击的回调，是否可以点击，取决于 column 中配置 action 与否和 dataSource 数据中配置 canTriggerAction
   */
  onClick?: (action: ActionTypes, uid: string | number) => void;
  /**
   * onClose
   */
  onClose?: () => void;
}

export const Roster: FC<RosterProps> = ({
  teacherName,
  columns = defaultColumns,
  dataSource,
  onClick,
  onClose,
  ...modalProps
}) => {
  return (
    <Modal
      className="roster-modal"
      width={606}
      title={t('roster.user_list')}
      onCancel={onClose}
      {...modalProps}>
      <div className="roster-wrap">
        <div className="roster-header">
          <label>{t('roster.teacher_name')}</label>
          {teacherName}
        </div>
        <Table className="roster-table">
          <TableHeader>
            {columns.map((col) => (
              <Col key={col.key}>{col.name}</Col>
            ))}
          </TableHeader>
          <Table className="table-container">
            {dataSource?.map((data) => (
              <Row className='border-bottom-width-1' key={data.uid}>
                {columns.map((col) => (
                  <Col key={col.key}>
                    <span
                      className={
                        !!data.disabled === false ? 'action' : ''
                      }
                      onClick={
                        !!data.disabled === false
                          ? () =>
                              col.action &&
                              onClick &&
                              onClick(col.action, data.uid)
                          : undefined
                      }>
                      {col.render
                        ? col.render((data as any)[col.key], data)
                        : (data as any)[col.key]}
                    </span>
                  </Col>
                ))}
              </Row>
            ))}
          </Table>
        </Table>
      </div>
    </Modal>
  );
};
