import { FC, useEffect, useState, useMemo } from 'react';
import { BaseWaveArmProps } from './types';
import { Card, SvgImg } from '~components';
import { transI18n } from '~ui-kit';
import { useInterval } from '@/infra/hooks/utilites';
import { Scheduler } from 'agora-rte-sdk';
import { useStore } from '@/infra/hooks/use-edu-stores';
import { observer } from 'mobx-react';
import { EduClassroomConfig } from 'agora-edu-core';

export enum WaveArmStateEnum {
  waveArmBefore = 'wave-arm-before',
  waveArming = 'wave-arm-ing',
  waveArmAfter = 'wave-arm-after',
}
export interface HandlerCondition {
  oldState: WaveArmStateEnum;
  newState: WaveArmStateEnum;
  callbackFn: () => void;
}

class FSM {
  currentState: WaveArmStateEnum;
  handlers: HandlerCondition[];
  timer: ReturnType<typeof setTimeout> | null = null;

  constructor(currentState: WaveArmStateEnum) {
    this.currentState = currentState;
    this.handlers = [];
  }

  handlerConditionMatch(oldeState: WaveArmStateEnum, newState: WaveArmStateEnum) {
    for (let i = 0; i < this.handlers.length; i++) {
      if (this.handlers[i].oldState === oldeState && this.handlers[i].newState === newState) {
        this.handlers[i].callbackFn();
      }
    }
  }

  /**
   * 跳转到新状态
   * @param newState
   * @returns
   */
  changeState(newState: WaveArmStateEnum) {
    const oldState = this.currentState;
    switch (newState) {
      case WaveArmStateEnum.waveArming:
        if (oldState === WaveArmStateEnum.waveArmBefore) {
          this.currentState = newState;
          this.handlerConditionMatch(oldState, newState);
        }
        break;
      case WaveArmStateEnum.waveArmAfter:
        if (oldState === WaveArmStateEnum.waveArming) {
          this.currentState = newState;
          this.handlerConditionMatch(oldState, newState);
          this.timer && clearTimeout(this.timer);
          this.timer = setTimeout(() => {
            this.currentState = WaveArmStateEnum.waveArmBefore;
            this.handlerConditionMatch(
              WaveArmStateEnum.waveArmAfter,
              WaveArmStateEnum.waveArmBefore,
            );
          }, 3000);
        }
        break;
    }
  }
  /**
   * 当从oldState跳转到newState时，执行handler
   * @param oldState 老状态
   * @param newState 新状态
   * @param handler 回调方法
   */
  whenAfter(oldState: WaveArmStateEnum, newState: WaveArmStateEnum, handler: () => void) {
    this.handlers.push({
      oldState: oldState,
      newState: newState,
      callbackFn: handler,
    });
  }

  getCurrentState() {
    return this.currentState;
  }
}

export const WaveArmSender: FC<BaseWaveArmProps> = observer(() => {
  const { handUpUIStore } = useStore();
  const { waveArm, teacherUuid } = handUpUIStore;
  const fsm = useMemo(() => new FSM(WaveArmStateEnum.waveArmBefore), []);
  const [firstTip, setFirstTip] = useState<boolean>(false);
  const [showTip, setShowTip] = useState<boolean>(false);

  const [countDownNum, setCountDownNum] = useState<number>(0);
  const [startCountDown, setStartCountDown] = useState<boolean>(false);

  useEffect(() => {
    let task: Scheduler.Task | undefined = undefined;

    const userName = EduClassroomConfig.shared.sessionInfo.userName;

    let promise: Promise<void> | null = null;

    fsm.whenAfter(WaveArmStateEnum.waveArmBefore, WaveArmStateEnum.waveArming, () => {
      setCountDownNum(3);
      setStartCountDown(false);
      promise = new Promise(async (resolve) => {
        task = Scheduler.shared.addPollingTask(async () => {
          await waveArm(teacherUuid, 3, { userName });
        }, Scheduler.Duration.second(3));
        resolve();
      });
    });

    fsm.whenAfter(WaveArmStateEnum.waveArming, WaveArmStateEnum.waveArmAfter, () => {
      setCountDownNum(3);
      setStartCountDown(true);
      promise?.then(async () => {
        task?.stop();
        await waveArm(teacherUuid, 3, { userName });
        promise = null;
      });
    });

    return () => {
      task?.stop();
    };
  }, []);

  const handleMouseDown = () => {
    setFirstTip(true);
    fsm.changeState(WaveArmStateEnum.waveArming);
  };

  const handleMouseUp = () => {
    fsm.changeState(WaveArmStateEnum.waveArmAfter);
  };

  useEffect(() => {
    if (firstTip) {
      setShowTip(true);
      const timer = setTimeout(() => {
        setShowTip(false);
        clearTimeout(timer);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [firstTip]);

  useInterval(
    (timer: ReturnType<typeof setTimeout>) => {
      if (startCountDown) {
        if (countDownNum > 1) {
          setCountDownNum(countDownNum - 1);
        } else {
          setCountDownNum(0);
          setStartCountDown(false);
        }
      } else {
        clearInterval(timer);
      }
    },
    1000,
    startCountDown,
  );

  return (
    <Card
      className="hands-up-sender"
      width={40}
      height={40}
      borderRadius={40}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}>
      {!countDownNum ? (
        <SvgImg type="hands-up-before" size={24} />
      ) : (
        <div className="hands-up-ing">{countDownNum}</div>
      )}
      {fsm.getCurrentState() !== WaveArmStateEnum.waveArmBefore && showTip ? (
        <div className="hands-up-tip">{transI18n('hands_up_tip')}</div>
      ) : null}
    </Card>
  );
});
