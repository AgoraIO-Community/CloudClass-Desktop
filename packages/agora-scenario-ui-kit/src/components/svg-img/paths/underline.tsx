import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <path
    d="M1 15.5157C21 11.2371 50.5 4.58457 54.5 3.92208C59.5 3.09397 77 -1.04657 77 2.2659C77 4.69285 68.9418 6.0887 60.5 8.26018C50.8958 10.7307 40.7952 13.9107 41.5 15.5157C42.2086 17.1293 56 13.453 60.5 12.2265C65 11 75.5702 8.84359 76.5 10.9611C78.1 14.6048 68.8333 17.1719 64 18"
    stroke={props.iconPrimary}
    stroke-linecap="round"
  />
);

export const underline = '0 0 78 19';
