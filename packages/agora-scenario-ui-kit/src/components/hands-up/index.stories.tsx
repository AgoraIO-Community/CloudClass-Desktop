import { Meta } from '@storybook/react';
import React, { useCallback, useState, useEffect } from 'react';
import { HandsUpManager, HandsUpSender, HandsUpState } from '~components/hands-up';
import { StudentInfo } from './types';

const meta: Meta = {
    title: 'Components/HandsUp',
    component: HandsUpManager,
    argTypes: {
        handsUpState: {
            control: {
                type: 'select',
                options: ['default', 'actived']
            }
        }
    }
}

type DocsProps = {
    handsUpState: HandsUpState;
}

export const Docs = ({handsUpState}: any) => {

    const [current, setCurrent] = useState(0)

    useEffect(() => {
        setCurrent(current + 1)
    }, [handsUpState])

    const [list, updateList] = useState<StudentInfo[]>([...'.'.repeat(10)].map((_, idx: number) => ({
        userName: `${idx}_name`,
        userUuid: `${idx}`,
        coVideo: false,
    })))

    const handleUpdateList = useCallback((type: string, info: StudentInfo) => {
        if (type === 'confirm') {
            updateList(
                list.filter((stu: StudentInfo) => stu.userUuid !== info?.userUuid)
            )
        }

        if (type === 'cancel') {
            updateList(
                list.filter((stu: StudentInfo) => stu.userUuid !== info?.userUuid)
            )
        }
    }, [list, updateList])

    return (
        <div className="flex justify-center m-screen h-screen items-end" style={{position: 'relative', top: -20}}>
            <HandsUpManager
                processUserCount={current}
                onlineUserCount={10}
                unreadCount={9}
                state={handsUpState}
                onClick={handleUpdateList}
                studentList={list}
                timeout={1500}
            />
        </div>
    )
}

Docs.args = {
    handsUpState: 'default',
}

export const StudentHandUp = () => {

    const [state, setActive] = useState<any>('default')

    return (
        <div className="flex justify-center items-center m-screen h-screen">
            <HandsUpSender
            state={state}
            onClick={() => setActive('actived')}
            />
        </div>
    )
}

StudentHandUp.args = {
    isActive: false,
}

export default meta;