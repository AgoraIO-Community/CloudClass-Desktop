import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) =>
    <g fill="none">
        <path d="M3.26043 19L3.11413 18.8746C2.95996 18.7426 2.86661 18.6626 3.48537 16.0805C4.55761 11.611 8.81184 8.72586 13.575 8.29498V5L21 10.7662L13.575 16.5324V13.2374C10.4888 13.0037 7.77583 13.2728 5.96021 15.2231C5.06373 16.186 3.98337 18.0939 3.72469 18.6561C3.68811 18.7351 3.62045 18.8817 3.4574 18.9371L3.26043 19Z" fill={props.iconPrimary} />
    </g>


export const viewBox = '0 0 24 24';