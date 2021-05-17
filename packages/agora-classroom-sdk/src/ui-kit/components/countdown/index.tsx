import { useWatch } from '@/ui-kit/utilities/hooks'
import React, { useState, useMemo, useEffect, useRef } from 'react'
import { BaseProps } from '../interface/base-props'
import './index.css'
export interface CountdownProps extends BaseProps {
    endDate?: Date | number;
    type?: number;
    theme?: number;
    timeUnit?: string[]
    onTimeUp?: Function
}

export const Countdown: React.FC<CountdownProps> = ({
    endDate = 0,
    type = 4,
    theme = 1,
    timeUnit = [],
    onTimeUp = () => { console.log('time up') },
    ...restProps
}) => {
    const [timeArray, setTimeArray] = useState<string[]>(
        theme === 2
            ? new Array(type * 2).fill("0")
            : new Array(type).fill("00")
    )
    const [timeArrayT, setTimeArrayT] = useState<string[]>(
        theme === 2
            ? new Array(type * 2).fill("0")
            : new Array(type).fill("00")
    )
    const [isAnimate, setIsAnimate] = useState<boolean[]>(
        theme === 2
            ? new Array(type * 2).fill(false)
            : new Array(type).fill(false)
    )
    const [timer, setTimer] = useState<null | ReturnType<typeof setTimeout>>(null)
    const endTime = useMemo(() => {
        if (endDate instanceof Date) {
            return endDate.getTime() + 1000;
        }
        return Number(endDate) > 0 ? Number(endDate) + 1000 : 0;
    }, [endDate])
    const step = useMemo(() => theme === 1 ? 1 : 2, [theme])
    const arr = useMemo(() => {
        const length = timeArray.length;
        const temp = [
            length - 1,
            length - step - 1,
            length - step * 2 - 1,
            length - step * 3 - 1,
        ];
        temp.length = type > 1 ? type : 1;
        return temp;
    }, [timeArray, type, step])
    useWatch(timeArray, (oldV: any) => {
        const newV = timeArray
        const diff: any[] = [];
        const temp = [...isAnimate]
        newV.forEach((value, index) => {
            if (value !== oldV[index]) {
                diff.push({ value, index });
                temp[index] = true;
            }
        });
        setIsAnimate(temp)
        setTimeout(() => {
            const temp = [...timeArrayT];
            diff.forEach((item) => {
                temp[item.index] = item.value;
            });
            setTimeArrayT(temp)
        }, 350);
    })
    useWatch(endTime, () => {
        if (endTime > 0) {
            start()
        } else {
            // restart时 endTime为0还要归位
            setTimeArray(theme === 2
                ? new Array(type * 2).fill("0")
                : new Array(type).fill("00"))
            timer && clearTimeout(timer);
            setTimer(null)
        }
    })

    useEffect(() => {
        start(0);
        return () => {
            timer && clearTimeout(timer);
            setTimer(null)
        }
    }, [])

    /**
     * 开始倒计时
     * @param st 重复执行的间隔时间
     */
    const start = (st = 1000) => {
        if (!endTime) return
        timer && clearTimeout(timer)
        setTimer(setTimeout(() => {
            let t = endTime - new Date().getTime(); // 剩余的毫秒数
            t = t < 0 ? 0 : t;
            let day = 0; // 剩余的天
            let hour = 0; // 剩余的小时
            let min = 0; // 剩余的分钟
            let second = 0; // 剩余的秒
            if (type >= 4) {
                day = Math.floor(t / 86400000); // 剩余的天
                hour = Math.floor(t / 3600000 - day * 24); // 剩余的小时 已排除天
                min = Math.floor(t / 60000 - day * 1440 - hour * 60); // 剩余的分钟 已排除天和小时
                second = Math.floor(t / 1000 - day * 86400 - hour * 3600 - min * 60); // 剩余的秒
            } else if (type >= 3) {
                hour = Math.floor(t / 3600000); // 剩余的小时
                min = Math.floor(t / 60000 - hour * 60); // 剩余的分钟 已排小时
                second = Math.floor(t / 1000 - hour * 3600 - min * 60); // 剩余的秒
            } else if (type >= 2) {
                min = Math.floor(t / 60000); // 剩余的分钟
                second = Math.floor(t / 1000 - min * 60); // 剩余的秒
            } else {
                second = Math.floor(t / 1000); // 剩余的秒
            }
            let ar = [];
            if (Number(theme) === 1) {
                // 不分开
                type >= 4 && ar.push(String(day).padStart(2, "0"));
                type >= 3 && ar.push(String(hour).padStart(2, "0"));
                type >= 2 && ar.push(String(min).padStart(2, "0"));
                ar.push(String(second).padStart(2, "0"));
            } else {
                // 分开
                type >= 4 && ar.push(...String(day).padStart(2, "0").split(""));
                type >= 3 && ar.push(...String(hour).padStart(2, "0").split(""));
                type >= 2 && ar.push(...String(min).padStart(2, "0").split(""));
                ar.push(...String(second).padStart(2, "0").split(""));
            }
            setTimeArray(ar)
            if (t > 0) {
                start();
            } else {
                timer && clearTimeout(timer);
                // 执行timeup
                onTimeUp && onTimeUp()
            }
        }, st));
    };
    // 动画完毕后，去掉对应的class, 为下次动画做准备
    const onAnimateEnd = (index: number) => {
        const temp = [...isAnimate]
        temp[index] = false;
        setIsAnimate(temp)
    };
    const isTimeUnitShow = (index: number) => {
        if (arr.includes(index)) {
            if (index === timeArray.length - 1 && !timeUnit[3]) {
                return false;
            }
            return true;
        }
        return false;
    };
    const setTimeUnit = (index: number) => {
        switch (index) {
            case timeArray.length - 1:
                return timeUnit[3] || ""; // 秒
            case timeArray.length - step - 1:
                return timeUnit[2] || ""; // 分
            case timeArray.length - step * 2 - 1:
                return timeUnit[1] || ""; // 时
            default:
                return timeUnit[0] || ""; // 天
        }
    };
    return (
        <div
            className={['react-countdown-component', theme !== 1 ? 'theme2' : ''].join(' ')}
            {...restProps}
        >
            {timeArray.map((item, index: any) => (
                <React.Fragment key={index}>
                    <div
                        className="time-box"
                        style={{
                            color: ((endTime - new Date().getTime() < 4000) && timer) ? '#F04C36' : '#4C6377'
                        }}
                    >
                        <div className="base">
                            {item}
                            <div className="base-b">{timeArrayT[index]}</div>
                        </div>
                        <div
                            className={['face', isAnimate[index] ? 'anime' : ''].join(' ')}
                            onAnimationEnd={() => { onAnimateEnd(index) }}
                        >
                            {timeArrayT[index]}
                        </div>
                        <div className={['back', isAnimate[index] ? 'anime' : ''].join(' ')}>{item}</div>

                    </div>
                    {
                        isTimeUnitShow(index) ?
                            (
                                <div className="time-unit" key={`unit-${index}`}>
                                    { setTimeUnit(index)}
                                </div>
                            ) : ""
                    }
                </React.Fragment>
            ))}
        </div>
    )
}