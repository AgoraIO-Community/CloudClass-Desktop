import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.4444 8.00021C12.4444 10.4551 10.4547 12.4448 7.99979 12.4448C5.54492 12.4448 3.55518 10.4551 3.55518 8.00021C3.55518 5.54535 5.54492 3.5556 7.99979 3.5556C10.4547 3.5556 12.4444 5.54535 12.4444 8.00021Z"
      fill="#292929"
      stroke="black"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.64888 9.41401L7.8374 8.33337V6.00439"
      stroke="white"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
);

export const viewBox = '0 0 16 16';
