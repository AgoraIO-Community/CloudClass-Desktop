import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <path
    fillRule="evenodd"
    clipRule="evenodd"
    d="M37.6744 14.1436C38.6997 15.0683 38.7812 16.6491 37.8564 17.6744L23.3259 33.7843C21.9037 35.3611 19.4296 35.3611 18.0074 33.7843L11.1436 26.1744C10.2188 25.1491 10.3003 23.5683 11.3256 22.6436C12.3508 21.7188 13.9317 21.8003 14.8564 22.8256L20.6667 29.2674L34.1436 14.3256C35.0683 13.3003 36.6491 13.2188 37.6744 14.1436Z"
    fill={props.iconPrimary}
  />
);

export const viewBox = '0 0 48 48';
