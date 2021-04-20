import React, { useState } from 'react'
import { Meta } from '@storybook/react';
import { Countdown } from './index'
import { Button } from '~components/button'

const meta: Meta = {
    title: 'Components/Countdown',
    component: Countdown,
}

type DocsProps = {
    endDate: Date | number;
    type: number;
    theme: number;
}

export const Docs = ({ endDate, type, theme }: DocsProps) => {
    const [result, setResult] = useState<number>(0)
    const [number, setNumber] = useState<number>(60)
    return (
        <div>
            <h1 className="mt-4">默认倒计时</h1>
            <Countdown
                endDate={endDate}
                theme={theme}
                type={type}
                timeUnit={[':',':',':']}
            />
            <h1 className="mt-4">简单交互demo</h1>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column'
                }}
            >
                <Countdown
                    endDate={result}
                    theme={theme}
                    type={type}
                    timeUnit={[':',':',':']}
                />
                
                <div className="mt-4"><input style={{border: '1px solid black'}} type="number" value={number} onChange={(e: any) => {setNumber(e.target.value)}}/>(seconds)</div>
                <div>
                    <Button 
                        className="mt-4"
                        onClick={() => {
                            if (number > 3600) {
                                alert('最大值为3600')
                                return;
                            }
                            const result = Date.now() + (number) * 1000
                            setResult(result)
                        }}
                    >Sure</Button>
                </div>
            </div>
        </div>
    )
}


Docs.args = {
    // endDate: Date.now() + 60 * 1000,
    endDate: new Date('2021-04-20 21:00:00'),
    type: 2,
    theme: 2,
}

export default meta;