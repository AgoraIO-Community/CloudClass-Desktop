import { useWatch } from "@/ui-kit/utilities/hooks";
import classnames from "classnames";
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import { Card, Icon, Popover, t, Tooltip } from "~components";
import { BaseHandsUpProps, HandsUpState, StudentInfo } from "./types";

export type HandleUpClick = (action: 'confirm' | 'cancel', student: StudentInfo) => Promise<void> | void;

const stateColorDict: Record<string, string> = {
  default: '#7B88A0',
  actived: '#357BF6',
}

export interface HandsUpManagerProps extends BaseHandsUpProps {
  state?: HandsUpState;
  timeout?: number;
  onClick: HandleUpClick;
  unreadCount?: number;
  studentList: StudentInfo[];
  processUserCount: number;
  onlineUserCount: number;
}

export const HandsUpManager: FC<HandsUpManagerProps> = ({
  width = 108,
  height = 41,
  borderRadius = 20,
  state = 'default',
  timeout = 1500,
  unreadCount = 0,
  className,
  studentList = [],
  onlineUserCount = 0,
  processUserCount = 0,
  onClick,
  ...restProps
}) => {
  const cls = classnames({
    [`hands-up hands-up-manager`]: 1,
    ['can-not-hover']: processUserCount === 0,
    [`${className}`]: !!className
  });

  const handleClick = () => {

  }

  const [popoverVisible, setPopoverVisible] = useState<boolean>(false);
  const [animStart, setAnimStart] = useState<boolean>(false);

  useWatch(processUserCount, prev => {
    if (prev !== undefined && processUserCount > prev) {
      setAnimStart(true)
    } else {
      setAnimStart(false)
    }
  })

  const coVideoList = studentList.filter((student: StudentInfo) => !student.coVideo)

  const content = useCallback(() => {
    return (<StudentsHandsUpList
      onClick={onClick}
      students={coVideoList}
    />)
  }, [coVideoList, onClick])

  return (
    <div className={cls} {...restProps}>
      <CSSTransition
        in={animStart}
        timeout={timeout}
        classNames={'received-card'}
        onEntered={() => {
          setAnimStart(false)
        }}
      >
        <Popover
          visible={popoverVisible}
          onVisibleChange={(visible) => {
            setPopoverVisible(visible)
          }}
          overlayClassName="customize-dialog-popover"
          trigger="hover"
          content={content}
          placement="topRight">
          <Card
            width={width}
            height={height}
            borderRadius={borderRadius}
          >
            {/* {unreadCount ? (<div className="unread-count"><span>{unreadCount < 10 ? unreadCount : '...'}</span></div>) : ""} */}
            <div className="hands-box-line">
              <Icon 
                size={28} 
                onClick={handleClick} 
                type={processUserCount ?(popoverVisible ? 'hands-up' : (state === 'default' ? 'hands-up-student' : 'hands-up')) : 'hands-up-student'} 
                color={processUserCount ? (popoverVisible ? '#639AFA' : (stateColorDict[state])) : stateColorDict['default']} 
              />
              <span className={'hands-apply-inline-box'}>{processUserCount} / {onlineUserCount}</span>
            </div>
          </Card>
        </Popover>
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
              <span className="operation-icon-wrap">
                <Icon 
                  type="checked"
                  useSvg
                  onClick={() => onClick("confirm", item)}
                />
                <Icon 
                  type="close" 
                  useSvg
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