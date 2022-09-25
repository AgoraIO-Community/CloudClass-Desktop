import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) =>
    <g fill="none">
        <rect width="7" height="7" rx="2" fill={props.iconPrimary} />
        <rect y="8" width="7" height="7" rx="2" fill={props.iconPrimary} />
        <rect x="8" width="7" height="7" rx="2" fill={props.iconPrimary} />
        <rect x="8" y="8" width="7" height="7" rx="2" fill={props.iconPrimary} />
        <rect x="16" width="7" height="7" rx="2" fill={props.iconPrimary} />
        <rect x="16" y="8" width="7" height="7" rx="2" fill={props.iconPrimary} />
    </g>



export const viewBox = '0 0 23 15';