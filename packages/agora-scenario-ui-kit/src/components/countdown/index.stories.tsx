import React, { useState } from 'react'
import { Meta } from '@storybook/react';
import { Countdown } from './index'
import { Button } from '../button'
import { Modal } from '../modal'
import { Input } from '../input'
import classnames from 'classnames'

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
    const [showSetting, setShowSetting] = useState<boolean>(true)
    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column'
                }}
            >
                <Modal
                    title={'countdown'}
                    width={258}
                    className={classnames({
                        [`countdown-modal`]: 1,
                        [`countdown-modal-hover`]: !showSetting
                    })}
                >

                    <div className="restart-wrap">
                        <Button
                            onClick={() => {
                                setResult(0)
                                setShowSetting(true)
                            }}
                        >restart</Button>
                    </div>

                    <Countdown
                        style={{ transform: 'scale(0.4)' }}
                        endDate={result}
                        theme={2}
                        type={2}
                        timeUnit={[':', ':', ':']}
                    />
                    {showSetting ? (
                        <div style={{ width: '100%' }}>
                            <div>
                                <Input
                                    type="number"
                                    min="0"
                                    max="3600"
                                    step="60"
                                    required
                                    value={number}
                                    onChange={(e: any) => { setNumber(e.target.value) }}
                                    suffix={<span style={{
                                        color: number <= 3600 ? '#333' : '#F04C36'
                                    }}>(seconds)</span>}
                                    maxNumber={3600}
                                    style={{
                                        color: number <= 3600 ? '#333' : '#F04C36'
                                    }}
                                />
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Button
                                    className="mt-4"
                                    onClick={() => {
                                        if (number > 3600) {
                                            alert('最大值为3600')
                                            return;
                                        }
                                        const result = Date.now() + (number) * 1000
                                        setResult(result)
                                        setShowSetting(false)
                                    }}
                                    disabled={number > 3600}
                                >Sure</Button>
                            </div>
                        </div>
                    ) : null}


                </Modal>
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