import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <g fill="none">
    <path
      d="M38 10L26 22M26 22L26 11.6316M26 22L36.3684 22"
      stroke={props.iconPrimary}
      strokeWidth="2.05714"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 38L22 26M22 26L22 36.3684M22 26L11.6316 26"
      stroke={props.iconPrimary}
      strokeWidth="2.05714"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </g>
);

export const viewBox = '0 0 48 48';
