import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <g fill="none">
    <path
      d="M19.5 8L15 12.5M15 12.5L15 9.28571M15 12.5L18.2143 12.5"
      stroke={props.iconPrimary}
      stroke-width="1.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M8 19.5L12.5 15M12.5 15L12.5 18.2143M12.5 15L9.28571 15"
      stroke={props.iconPrimary}
      stroke-width="1.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </g>
);

export const viewBox = '0 0 28 28';
