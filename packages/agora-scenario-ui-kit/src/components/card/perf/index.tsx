import classNames from 'classnames';
import Draggable from 'react-draggable';
import { Card } from '../index';
import './index.css';

export type MemoryPerfProps = {
  title: string;
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
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
      <div>external: {props.external}MB</div>
    </div>
  );
};
