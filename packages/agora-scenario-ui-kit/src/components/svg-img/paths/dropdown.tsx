import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <g fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.9342 28.0221L16.2822 19.6196C15.7632 18.964 16.231 18 17.0671 18L31.9329 18C32.769 18 33.2359 18.9651 32.7169 19.6207L26.0681 28.0193C25.2674 29.0307 23.7349 29.0336 22.9342 28.0221Z"
      fill={props.iconPrimary}
    />
  </g>
);

export const viewBox = '0 0 48 48';
