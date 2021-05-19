import { Countdown, Button, Input } from '~ui-kit';
import { observer } from 'mobx-react';
import * as React from 'react';
import { useState } from 'react';

export type CountdownContainerProps = {
    
}

export const CountdownContainer: React.FC<CountdownContainerProps> = observer((props) => {
    const [number, setNumber] = useState<number>(60)
    const [showSetting, setShowSetting] = useState<boolean>(true)
    const [result, setResult] = useState<number>(0)
    return (
        <>
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
            ></Countdown>
            {showSetting ? (
                <div style={{ width: '100%' }}>
                    <div>
                        <Input
                            type="number"
                            value={number}
                            onChange={(e: any) => { setNumber(e.target.value) }}
                            suffix={<span>(seconds)</span>}
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
                        >Sure</Button>
                    </div>
                </div>
            ) : null}
        </>
    )
})