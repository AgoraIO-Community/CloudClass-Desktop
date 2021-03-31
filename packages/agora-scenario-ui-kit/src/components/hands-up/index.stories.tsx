import { Meta } from '@storybook/react';
import React, { useCallback, useState } from 'react';
import { HandsUpManager, HandsUpSender, HandsUpState } from '~components/hands-up';
import { StudentInfo } from './types';

const meta: Meta = {
    title: 'Components/HandsUp',
    component: HandsUpManager,
    argTypes: {
        handsUpState: {
            control: {
                type: 'select',
                options: ['default', 'received', 'stalled', 'active']
            }
        }
    }
}

type DocsProps = {
    handsUpState: HandsUpState;
}

export const Docs = ({handsUpState, animStart}: any) => {

    const [list, updateList] = useState<StudentInfo[]>([...'.'.repeat(5)].map((_, idx: number) => ({
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
        <div className="flex justify-center items-center m-screen h-screen">
            <HandsUpManager
                unreadCount={9}
                state={handsUpState}
                onClick={handleUpdateList}
                studentList={list}
            />
        </div>
    )
}

Docs.args = {
    handsUpState: 'default',
    animStart: false
}

export const StudentHandUp = () => {

    const [state, setActive] = useState<any>('default')

    return (
        <div className="flex justify-center items-center m-screen h-screen">
            <HandsUpSender
            state={state}
            onClick={() => setActive('apply')}
            />
        </div>
    )
}

StudentHandUp.args = {
    isActive: false,
}

export default meta;