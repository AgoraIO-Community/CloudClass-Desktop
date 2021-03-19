import React, {useState, useEffect} from 'react'
import { Meta } from '@storybook/react';
import { HandsUp, StudentHandsUp, StudentsHandsUpList } from '~components/hands-up'

const meta: Meta = {
    title: 'Components/HandsUp',
    component: HandsUp,
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
    handsUpState: string;
}

export const Docs = ({ handsUpState }: DocsProps) => {
    let [animStart, setAnimStart] = useState<boolean>(false)
    useEffect(() => {
        let flag = handsUpState === 'received'
        if (flag) {
            setAnimStart(flag)
            setTimeout(() => {
                setAnimStart(false)
            }, 1500)
        }
    }, [handsUpState])
    return (
        <>
            <div className="mt-4">
                <HandsUp
                    state={handsUpState}
                    animStart={animStart}
                />
            </div>
            <div className="mt-4">
                <StudentHandsUp
                    student={{
                        id: '1',
                        name: 'Peter'
                    }}
                />
            </div>
            <div className="mt-4">
                <StudentsHandsUpList
                    students={[...'.'.repeat(100)].map((item, index) => ({
                        id: 'student' + (index + 1),
                        name: 'student' + (index + 1),
                    }))}
                />
            </div>
        </>
    )
}

Docs.args = {
    handsUpState: 'default'
}

export default meta;