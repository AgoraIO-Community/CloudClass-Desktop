import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = ({ iconPrimary }: PathOptions) => (
  <g>
    <g clipPath="url(#clip0_7417_93401)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.7362 25.9406C10.2682 25.0539 10.2682 23.9461 9.7362 23.0594L6.47099 17.6174C6.13001 17.0491 6.31429 16.312 6.88258 15.971C7.45088 15.63 8.18799 15.8143 8.52897 16.3826L11.7942 21.8246C12.7822 23.4714 12.7822 25.5286 11.7942 27.1754L8.52897 32.6174C8.18799 33.1857 7.45088 33.37 6.88258 33.029C6.31429 32.688 6.13001 31.9509 6.47099 31.3826L9.7362 25.9406Z"
        fill={iconPrimary}></path>
    </g>
    <defs>
      <clipPath id="clip0_7417_93401">
        <rect width="48" height="20" fill="white" transform="translate(20) rotate(90)"></rect>
      </clipPath>
    </defs>
  </g>
);
export const viewBox = '0 0 20 48';
