import classnames from "classnames";
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import { Card, Icon, Popover, t, Tooltip } from "~components";
import { BaseHandsUpProps, HandsUpState, StudentInfo } from "./types";

export type HandleUpClick = (action: 'confirm' | 'cancel', student: StudentInfo) => Promise<void> | void;

const stateColorDict: Record<string, string> = {
  default: '#7B88A0',
  received: '#7b88a0',
  stalled: '#191919',
  active: '#2e73ff'
}

export interface HandsUpManagerProps extends BaseHandsUpProps {
  state?: HandsUpState;
  animStart?: boolean;
  timeout?: number;
  onClick: HandleUpClick;
  unreadCount?: number;
  studentList: StudentInfo[]
}

export const HandsUpManager: FC<HandsUpManagerProps> = ({
  width = 108,
  height = 41,
  borderRadius = 20,
  state = 'default',
  animStart = false,
  timeout = 1000,
  unreadCount = 0,
  className,
  studentList = [],
  onClick,
  ...restProps
}) => {
  const cls = classnames({
    [`hands-up`]: 1,
    [`${className}`]: !!className,
  });

  const handleClick = () => {

  }

  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);

  const coVideoList = studentList.filter((student: StudentInfo) => !student.coVideo)

  const content = useCallback(() => {
    return (<StudentsHandsUpList
      onClick={onClick}
      students={coVideoList}
    />)
  }, [coVideoList, onClick])

  const coVideoSize = studentList.filter((student: StudentInfo) => !!student.coVideo).length

  return (
    <div className={cls} {...restProps}>
      <CSSTransition
        in={animStart}
        timeout={timeout}
        classNames={'received-card'}
      >
        <Card
          width={width}
          height={height}
          borderRadius={borderRadius}
        >
          {/* {unreadCount ? (<div className="unread-count"><span>{unreadCount < 10 ? unreadCount : '...'}</span></div>) : ""} */}
          <Popover
            visible={popoverVisible}
            onVisibleChange={(visible) => setPopoverVisible(visible)}
            overlayClassName="customize-dialog-popover"
            trigger="click"
            content={content}
            placement="top">
            <div className="hands-box-line">
              <Icon size={28} onClick={handleClick} type={state === 'default' ? 'hands-up-student' : 'hands-up'} hover={true} color={stateColorDict[state]} />
              <span className={'hands-apply-inline-box'}>{coVideoSize} / {studentList.length}</span>
            </div>
          </Popover>
        </Card>
      </CSSTransition>
    </div>
  )
}

export interface StudentHandsUpProps extends BaseHandsUpProps {
  student?: StudentInfo;
  state?: string;
  onClick: (type: any, userUuid: string) => void | Promise<void>;
}

export const StudentHandsUp: FC<StudentHandsUpProps> = ({
  student,
  width = 210,
  height = 40,
  borderRadius = 20,
  className,
  onClick,
  state = 'default',
  ...restProps
}) => {
  const cls = classnames({
    [`student-hands-up`]: 1,
    [`${className}`]: !!className,
  });

  return (
    <div className={cls} {...restProps}>
      <Card
        width={width}
        height={height}
        borderRadius={borderRadius}
      >
        <div className="student-box">
          <span className="student-name">{student?.userName}</span>
          <span>
            <Icon hover={true} type="checked" color="#0073FF" onClick={() => onClick('confirm', student!.userUuid)} />
            <Icon hover={true} type="close" style={{ marginLeft: 6 }} onClick={() => onClick('cancel', student!.userUuid)} />
          </span>
        </div>
      </Card>
    </div>
  )
}

export interface StudentsHandsUpListProps extends BaseHandsUpProps {
  students: StudentInfo[];
  onClick: HandleUpClick
}

export const StudentsHandsUpList: FC<StudentsHandsUpListProps> = ({
  students,
  width = 210,
  borderRadius = 12,
  className,
  onClick,
  ...restProps
}) => {
  const cls = classnames({
    [`students-hands-up`]: 1,
    [`${className}`]: !!className,
  });
  return (
    students.length ? <div className={cls} {...restProps}>
      <Card
        className={'hands-up-card'}
        borderRadius={borderRadius}
      >
        {
          students.map((item, index) => (
            <div className="student-item" key={index}>
              <span className="student-name">{item?.userName}</span>
              <span>
                <Icon type="checked"
                  color="#0073FF"
                  hover={true}
                  onClick={() => onClick("confirm", item)}
                />
                <Icon type="close" style={{ marginLeft: 6 }}
                  hover={true}
                  onClick={() => onClick("cancel", item)}
                />
              </span>
            </div>
          ))
        }
      </Card>
    </div> : null
  )
}