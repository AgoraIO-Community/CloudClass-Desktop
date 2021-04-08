import React, { FC } from 'react';
import { transI18n } from '~components/i18n';
import { MonitorInfo } from '.';

export type SignalContentProps = MonitorInfo & {
  isNative: boolean
}

export const SignalContent: FC<SignalContentProps> = (monitor) => (
  <>
    <div className="biz-signal-content-row">
      <span className="biz-col padding-right-27">
        <label>{transI18n('signal.delay')}:&nbsp;</label>
        <span>{monitor.networkLatency}ms</span>
      </span>
      <span className="biz-col">
        <label>{transI18n('signal.lose')}:&nbsp;</label>
        <span>{monitor.packetLostRate}%</span>
      </span>
    </div>
    <div className="biz-signal-content-row margin-top-9">
      <span className="biz-col padding-right-27">
        <label>{transI18n('signal.status')}:&nbsp;</label>
        <span>{monitor.networkQuality}</span>
      </span>
      {monitor.isNative ? <span className="biz-col">
        <label>{transI18n('signal.CPU')}:&nbsp;</label>
        <span>{monitor.cpuUsage}%</span>
      </span> : null}
    </div>
  </>
);
