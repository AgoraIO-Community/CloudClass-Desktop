import React, { FC } from 'react';
import classnames from 'classnames';
import { BaseProps } from '~components/interface/base-props';
import { Card } from '~components/card'
import { Icon } from '~components/icon'
import { CSSTransition } from 'react-transition-group'
import './index.css';

enum HandsUpState {
    Default = 'default',
    Received = 'received',
    Stalled = 'stalled',
    Active = 'active',
}

const stateColorDict: Record<string, string> = {
    default: '#7B88A0',
    received: '#7b88a0',
    stalled: '#191919',
    active: '#2e73ff'
}

export interface BaseHandsUpProps extends BaseProps {
    width?: number;
    height?: number;
    borderRadius?: number;
}

export interface HandsUpProps extends BaseHandsUpProps {
    state?: string;
    current?: number;
    total?: number;
    animStart?: boolean;
    timeout?: number;
}

export const HandsUp: FC<HandsUpProps> = ({
    width = 108,
    height = 52,
    borderRadius = 20,
    state = HandsUpState.Default,
    current = 0,
    total = 22,
    animStart = false,
    timeout = 1500,
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`hands-up`]: 1,
        [`${className}`]: !!className,
    });
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
                    <Icon type={state === HandsUpState.Default ? 'hands-up-student' : 'hands-up'} color={stateColorDict[state]} />
                    <span style={{ marginLeft: 10 }}>{current} / {total}</span>
                </Card>
            </CSSTransition>
        </div>
    )
}

interface Student {
    id?: string;
    name?: string;
}

export interface StudentHandsUpProps extends BaseHandsUpProps {
    student?: Student;
}

export const StudentHandsUp: FC<StudentHandsUpProps> = ({
    student,
    width = 210,
    height = 40,
    borderRadius = 20,
    className,
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
                    <span className="student-name">{student?.name}</span>
                    <span>
                        <Icon type="checked" color="#0073FF"/>
                        <Icon type="close" style={{ marginLeft: 6 }} />
                    </span>
                </div>
            </Card>
        </div>
    )
}

export interface StudentsHandsUpListProps extends BaseHandsUpProps {
    students?: Student[]
}

export const StudentsHandsUpList: FC<StudentsHandsUpListProps> = ({
    students,
    width = 210,
    height = 114,
    borderRadius = 12,
    className,
    ...restProps
}) => {
    const cls = classnames({
        [`students-hands-up`]: 1,
        [`${className}`]: !!className,
    });
    return (
        <div className={cls} {...restProps}>
            <Card
                width={width}
                height={height}
                borderRadius={borderRadius}
            >

                {
                    students?.map((item, index) => (
                        <div className="student-item" key={index}>
                            <span className="student-name">{item?.name}</span>
                            <span>
                                <Icon type="checked" color="#0073FF"/>
                                <Icon type="close" style={{ marginLeft: 6 }} />
                            </span>
                        </div>
                    ))
                }

            </Card>
        </div>
    )
}