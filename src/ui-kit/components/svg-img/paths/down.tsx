
import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) =>
    <g fill="none">
        <path d="M9.31131 1.11307L5.4525 4.97188C5.20111 5.22327 4.79889 5.22327 4.5475 4.97188L0.68869 1.11307C0.286468 0.710849 0.56928 0.0195312 1.14119 0.0195312H8.85881C9.43072 0.0195312 9.71353 0.710849 9.31131 1.11307Z" fill={props.iconPrimary} />
    </g>


export const viewBox = '0 0 10 6';
