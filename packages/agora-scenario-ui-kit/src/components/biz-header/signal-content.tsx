import React, { FC } from 'react';
import { transI18n } from '~components/i18n';
import { MonitorInfo } from '.';

export type SignalContentProps = MonitorInfo & {
  isNative: boolean;
};

export const SignalContent: FC<SignalContentProps> = (monitor) => (
  <>
    {monitor.isNative ? (
      <div className="biz-signal-content-row">
        <span className="biz-col padding-right-27">
          <label className="right-gap">{transI18n('signal.status')}:</label>
          <span className="left-gap">{monitor.networkQuality}</span>
        </span>
      </div>
    ) : null}
    <div className="biz-signal-content-row margin-top-9">
      <span className="biz-col padding-right-27">
        <label className="right-gap">{transI18n('signal.delay')}:</label>
        <span className="left-gap">{monitor.networkLatency}ms</span>
      </span>
    </div>
    {monitor.isNative ? (
      <div className="biz-signal-content-row margin-top-9">
        <span className="biz-col">
          <label className="right-gap">{transI18n('signal.CPU')}:</label>
          <span className="left-gap">{monitor.cpuUsage}%</span>
        </span>
      </div>
    ) : null}
    <div className="biz-signal-content-row margin-top-9">
      <span className="biz-col">
        <label className="right-gap">
          {monitor.isNative ? transI18n('signal.lose') : transI18n('signal.status')}:
        </label>
        {monitor.isNative ? (
          <span className="label-info-list left-gap fr">
            <div className="left-gap">
              {monitor.rxPacketLossRate}% {transI18n('signal.receive')}
            </div>
            <div className="left-gap">
              {monitor.txPacketLossRate}% {transI18n('signal.send')}
            </div>
          </span>
        ) : (
          <span className="label-info-list left-gap fr">
            <div className="left-gap">
              {monitor.rxNetworkQuality} {transI18n('signal.receive')}
            </div>
            <div className="left-gap">
              {monitor.txNetworkQuality} {transI18n('signal.send')}
            </div>
          </span>
        )}
      </span>
    </div>
  </>
);
