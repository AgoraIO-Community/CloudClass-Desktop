import React, { FC } from 'react';
import { MonitorInfo } from '.';

export const SignalContent: FC<MonitorInfo> = (monitor) => (
  <>
    <div className="biz-signal-content-row">
      <span className="biz-col padding-right-27">
        <label>网络延迟:&nbsp;</label>
        <span>{monitor.networkLatency}ms</span>
      </span>
      <span className="biz-col">
        <label>丢包率:&nbsp;</label>
        <span>{monitor.packetLostRate}%</span>
      </span>
    </div>
    <div className="biz-signal-content-row margin-top-9">
      <span className="biz-col padding-right-27">
        <label>网络状态:&nbsp;</label>
        <span>{monitor.networkQuality}</span>
      </span>
      <span className="biz-col">
        <label>CPU:&nbsp;</label>
        <span>{monitor.cpuUsage}%</span>
      </span>
    </div>
  </>
);
