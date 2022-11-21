import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) =>
    <g fill="none">
        <rect opacity="0.05" x="2.5" y="2.5" width="25" height="25" rx="7.5" fill="#030303" />
        <rect x="6.25" y="6.25" width="17.5" height="17.5" rx="8.75" fill="#0056FD" />
        <path d="M11.25 15.625L13.9123 18.4775C14.0499 18.6248 14.2835 18.6248 14.421 18.4775L20 12.5" stroke="white" strokeWidth="2.1747" strokeLinecap="round" />
    </g>


export const viewBox = '0 0 30 30';

