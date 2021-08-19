import React from 'react';
import { Progress } from '.';

export default {
  title: 'Components/Progress',
};

export const ProgressShowCase = (props: any) => {
  return <Progress width={props.width} type="download" progress={props.progress}></Progress>;
};

ProgressShowCase.args = {
  width: 100,
  progress: 100,
};
