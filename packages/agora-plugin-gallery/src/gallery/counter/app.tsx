import React, { useEffect } from 'react';
import { usePluginStore, useTimeCounter } from './hooks';
import { observer } from 'mobx-react';
import { Button, Input, transI18n } from '~ui-kit';
import FlipClock, { formatDiff } from './flip-clock';
import { MaskCountDown } from './mask-count-down';
import { autorun } from 'mobx';
import { AgoraCountdown } from '.';

const App = observer(({ widget }: { widget: AgoraCountdown }) => {
  const pluginStore = usePluginStore();
  const { duration, setDuration, play, reset } = useTimeCounter();
  const durationRef = React.useRef<number>(duration);
  const [caution, setCaution] = React.useState(false);

  const handleSetting = () => {
    const { x, y } = widget.track.ratioVal.ratioPosition;
    widget.setActive({
      extra: {
        state: 1,
        startTime: Date.now() + pluginStore.getTimestampGap,
        duration: pluginStore.number !== null ? pluginStore.number : 0,
      },
      position: { xaxis: x, yaxis: y },
    });

    pluginStore.handleSetting(false);
    setDuration(pluginStore.number as number);
    play();
  };

  const handleRestart = React.useCallback(() => {
    reset();

    pluginStore.handleSetting(true);

    widget.updateWidgetProperties({
      extra: { state: 0, startTime: 0, duration: 0 },
    });
  }, []);

  useEffect(() => {
    return autorun(() => {
      const { extra } = widget.roomProperties;
      if (extra && extra.startTime) {
        const serverTimeCalcByLocalTime = Date.now() + pluginStore.getTimestampGap;
        const direction = serverTimeCalcByLocalTime - (extra.startTime + extra.duration * 1000); // 判断方向
        if (direction < 0) {
          const duration =
            extra.duration -
            Math.floor(Math.abs(serverTimeCalcByLocalTime - extra.startTime) / 1000);
          setDuration(duration);
          play();
          pluginStore.setShowSetting(false);
        }
      }
    });
  }, []);

  React.useEffect(() => {
    if (durationRef.current !== duration && duration < 3) {
      setCaution(true);
    } else {
      setCaution(false);
    }
    durationRef.current = duration;
  }, [duration]);

  const handleNumberChange = React.useCallback((value: string) => {
    if (value) {
      let number = +value;
      number >= 3600 && (number = 3600);
      number < 1 && (number = 1);
      pluginStore.setNumber(number);
      formatDiff(number);
    } else {
      pluginStore.setNumber(null);
    }
  }, []);

  return (
    <div style={{ padding: '21px 14px' }}>
      <MaskCountDown
        enable={pluginStore.maskEnable}
        content={<Button onClick={handleRestart}> {transI18n('widget_countdown.restart')}</Button>}>
        <FlipClock duration={duration} caution={!pluginStore.showSetting && caution} />
      </MaskCountDown>
      {pluginStore.showSetting && (
        <div className="text-center mt-3.5">
          <div style={{ width: '180px', height: '40px', marginLeft: 'auto', marginRight: 'auto' }}>
            <Input
              value={pluginStore.number}
              onChange={(e: any) => {
                handleNumberChange(e.target.value.replace(/\D+/g, ''));
              }}
              suffix={
                <span
                  className={`${
                    pluginStore.number != null &&
                    pluginStore.number <= 3600 &&
                    pluginStore.number >= 1
                      ? 'count-input-color-normal'
                      : 'count-input-color-error'
                  }`}>
                  ({transI18n('widget_countdown.seconds')})
                </span>
              }
              className={`${
                pluginStore.number != null && pluginStore.number <= 3600 && pluginStore.number >= 1
                  ? 'count-input-color-normal'
                  : 'count-input-color-error'
              }`}
              maxNumber={3600}
            />
          </div>
          <Button
            className="btn-rewrite-disabled mt-3.5"
            onClick={handleSetting}
            disabled={
              (pluginStore.number !== null && pluginStore.number > 3600) ||
              (pluginStore.number !== null && pluginStore.number < 1) ||
              pluginStore.number === null
            }>
            {transI18n('widget_countdown.start')}
          </Button>
        </div>
      )}
    </div>
  );
});

export default App;
