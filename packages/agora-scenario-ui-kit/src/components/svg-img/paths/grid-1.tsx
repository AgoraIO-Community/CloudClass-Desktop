import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) =>
    <g fill="none">
        <rect width="17" height="15" rx="4" fill={props.iconPrimary} />
        <rect x="18" width="6" height="5" rx="1.2" fill={props.iconPrimary} />
        <rect x="18" y="6" width="6" height="4" rx="1.2" fill={props.iconPrimary} />
        <rect x="18" y="11" width="6" height="4" rx="1.2" fill={props.iconPrimary} />
    </g>



export const viewBox = '0 0 24 15';