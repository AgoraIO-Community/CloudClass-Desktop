import { useClassroomStatsContext, useMediaContext } from 'agora-edu-core';
import { observer } from 'mobx-react';
import React from 'react';
import { IconTypes, Popover, SvgImg } from '~ui-kit';
import { SignalContent } from '~ui-kit/components/biz-header/signal-content';

const SIGNAL_QUALITY_ICONS: { [key: string]: string } = {
  excellent: 'normal-signal',
  good: 'normal-signal',
  bad: 'bad-signal',
  unknown: 'unknown-signal',
};

export const SignalQualityComponent = observer(() => {
  const { isNative } = useMediaContext();

  const monitor = useClassroomStatsContext();

  return (
    <Popover content={<SignalContent {...monitor} isNative={isNative} />} placement="bottomLeft">
      <div className={`biz-signal-quality ${monitor.networkQuality}`}>
        <SvgImg
          className="cursor-pointer"
          type={SIGNAL_QUALITY_ICONS[monitor.networkQuality] as IconTypes}
          size={24}
        />
      </div>
    </Popover>
  );
});
