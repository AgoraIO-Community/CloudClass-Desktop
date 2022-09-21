import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <g fill="none">
    <path
      d="M8.25 15.0104V15.0104C8.25 15.8331 8.91691 16.5 9.73958 16.5H13.75C14.7625 16.5 15.5833 15.6792 15.5833 14.6667V8.70833C15.5833 7.69581 14.7625 6.875 13.75 6.875V6.875"
      stroke={props.strokeColor || 'black'}
      strokeWidth="1.28333"
    />
    <rect
      x="6.4165"
      y="5.04199"
      width="6.875"
      height="9.625"
      rx="1.83333"
      stroke={props.strokeColor || 'black'}
      strokeWidth="1.28333"
    />
  </g>
);

export const viewBox = '0 0 22 22';
