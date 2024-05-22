import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = ({ iconPrimary, iconSecondary }: PathOptions) => (
  <>
    <path
      fill={iconPrimary}
      stroke={iconSecondary}
      d="M8-.5H0v1c1.553 0 3.033.664 4.065 1.825l2.814 3.166a1.5 1.5 0 002.242 0l2.814-3.166A5.438 5.438 0 0116 .5v-1H8z"></path>
  </>
);

export const viewBox = '0 4 16 8';
