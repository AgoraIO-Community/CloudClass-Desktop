import { Inline, transI18n } from '~ui-kit';
import { useLiveRoomStatsContext } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useMemo } from 'react';
import { formatCountDown, TimeFormatType } from '@/infra/utils';

const CLASS_STATUS_TEXT_COLOR: { [key: string]: string } = {
  'pre-class': '#677386',
  'in-class': '#677386',
  'end-class': '#F04C36',
};

export const ClassStatusComponent = observer(() => {
  const { liveClassStatus } = useLiveRoomStatsContext();
  const classStatusText = useMemo(() => {
    const { classState, duration } = liveClassStatus;

    const stateMap = {
      default: () => `-- ${transI18n('nav.short.minutes')} -- ${transI18n('nav.short.seconds')}`,
      'pre-class': () =>
        `${transI18n('nav.to_start_in')}${formatCountDown(duration, TimeFormatType.Timeboard)}`,
      'in-class': () =>
        `${transI18n('nav.started_elapse')}${formatCountDown(duration, TimeFormatType.Timeboard)}`,
      'end-class': () =>
        `${transI18n('nav.ended_elapse')}${formatCountDown(duration, TimeFormatType.Timeboard)}`,
    };

    if (stateMap[classState]) {
      return stateMap[classState]();
    }

    return stateMap['default']();
  }, [JSON.stringify(liveClassStatus), formatCountDown]);
  return (
    <Inline color={CLASS_STATUS_TEXT_COLOR[liveClassStatus.classState]}>{classStatusText}</Inline>
  );
});
