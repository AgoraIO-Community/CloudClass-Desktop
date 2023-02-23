import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <g fill="none">
    <path
      d="M26 22L38 10M38 10L38 20.3684M38 10L27.6316 10"
      stroke={props.iconPrimary}
      strokeWidth="2.05714"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 26L10 38M10 38L10 27.6316M10 38L20.3684 38"
      stroke={props.iconPrimary}
      strokeWidth="2.05714"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </g>
);

export const viewBox = '0 0 48 48';
