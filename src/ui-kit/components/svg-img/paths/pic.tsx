import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) =>
    <g fill="none">
        <rect x="5.5" y="6" width="15" height="13" rx="2" stroke={props.iconPrimary} />
        <circle cx="9.5" cy="9.5" r="1.5" fill={props.iconPrimary} />
        <path fillRule="evenodd" clipRule="evenodd" d="M20.5 12.6822V17C20.5 18.1046 19.6046 19 18.5 19H7.5C6.39543 19 5.5 18.1046 5.5 17V14.5234C6.23294 13.5892 7.30531 13 8.5 13C9.06996 13 9.61208 13.1341 10.1028 13.3758C11.0763 11.3772 13.1273 10 15.5 10C17.587 10 19.4251 11.0655 20.5 12.6822Z" fill={props.iconPrimary} />
    </g>

export const viewBox = '0 0 26 26'
