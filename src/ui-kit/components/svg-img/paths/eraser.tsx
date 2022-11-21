import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) =>
    <g fill="none">
        <rect x="14.3334" y="17.2376" width="10" height="10.2" rx="1.11959" transform="rotate(-135 14.3334 17.2376)" fill={props.iconPrimary} />
        <path d="M11.0299 18.9698C10.1554 19.8443 8.73765 19.8443 7.8632 18.9698L5.53015 16.6368C4.6557 15.7623 4.6557 14.3446 5.53015 13.4701L7.15236 11.8479L12.6521 17.3476L11.0299 18.9698Z" fill={props.iconPrimary} fillOpacity="0.7" />
    </g>



export const viewBox = '0 0 24 24';