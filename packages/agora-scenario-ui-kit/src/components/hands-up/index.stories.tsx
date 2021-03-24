import { Meta } from '@storybook/react';
import React, { useCallback, useEffect, useState } from 'react';
import { HandsUpManager, HandsUpSender, HandsUpState, StudentHandsUp, StudentsHandsUpList } from '~components/hands-up';
import { I18nProvider } from '~components/i18n';
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
            <I18nProvider>
                <HandsUpManager
                    unreadCount={9}
                    state={handsUpState}
                    onClick={handleUpdateList}
                    studentList={list}
                />
            </I18nProvider>
        </div>
    )
}

Docs.args = {
    handsUpState: 'default',
    animStart: false
}

export const StudentHandUp = () => {

    const [isActive, setActive] = useState<boolean>(false)

    return (
        <div className="flex justify-center items-center m-screen h-screen">
            <I18nProvider>
                <HandsUpSender
                  isActive={isActive}
                  onClick={() => setActive(!isActive)}
                />
            </I18nProvider>
        </div>
    )
}

StudentHandUp.args = {
    isActive: false,
}

export default meta;