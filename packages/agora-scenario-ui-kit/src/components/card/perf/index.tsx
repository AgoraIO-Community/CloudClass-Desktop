import classNames from 'classnames';
import './index.css';

export type ResourceInfo = {
  count: number;
  size: number;
  liveSize: number;
};

export type MemoryPerfProps = {
  title: string;
  isNative: boolean;
  rss?: number;
  heapTotal: number;
  heapUsed: number;
  external?: number;
  images?: ResourceInfo;
  scripts?: ResourceInfo;
  cssStyleSheets?: ResourceInfo;
  xslStyleSheets?: ResourceInfo;
  fonts?: ResourceInfo;
  other?: ResourceInfo;
};

export const MemoryPerf: React.FC<MemoryPerfProps> = (props) => {
  const cls = classNames({
    'perf-table': 1,
  });

  return (
    <div className={cls}>
      <h5>{props.title}</h5>
      <div>rss: {props.rss}MB</div>
      <div>heapTotal: {props.heapTotal}MB</div>
      <div>heapUsed: {props.heapUsed}MB</div>
      {props.isNative ? (
        <>
          <div>external: {props.external}MB</div>
          <h5>webFrame:</h5>
          <div className="grid-con">
            <div className="grid-box">object</div>
            <div className="grid-box">count</div>
            <div className="grid-box">size</div>
            <div className="grid-box">liveSize</div>
            <div className="grid-row">
              <div>images</div>
              <div>{props.images!.count}</div>
              <div>{props.images!.size}MB</div>
              <div>{props.images!.liveSize}MB</div>
            </div>
            <div className="grid-row">
              <div>scripts</div>
              <div>{props.scripts!.count}</div>
              <div>{props.scripts!.size}MB</div>
              <div>{props.scripts!.liveSize}MB</div>
            </div>
            <div className="grid-row">
              <div>cssStyleSheets</div>
              <div>{props.cssStyleSheets!.count}</div>
              <div>{props.cssStyleSheets!.size}MB</div>
              <div>{props.cssStyleSheets!.liveSize}MB</div>
            </div>
            <div className="grid-row">
              <div>xslStyleSheets</div>
              <div>{props.xslStyleSheets!.count}</div>
              <div>{props.xslStyleSheets!.size}MB</div>
              <div>{props.xslStyleSheets!.liveSize}MB</div>
            </div>
            <div className="grid-row">
              <div>fonts</div>
              <div>{props.fonts!.count}</div>
              <div>{props.fonts!.size}MB</div>
              <div>{props.fonts!.liveSize}MB</div>
            </div>
            <div className="grid-row">
              <div>other</div>
              <div>{props.other!.count}</div>
              <div>{props.other!.size}MB</div>
              <div>{props.other!.liveSize}MB</div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
