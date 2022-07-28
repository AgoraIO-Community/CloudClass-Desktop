import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) =>
    <g fill="none">
        <path d="M20 11.3628V17.9666C20 18.5366 19.5516 19 19 19H5C4.44844 19 4 18.5366 4 17.9666V11.3628C4 11.2917 4.05625 11.2336 4.125 11.2336H9.125C9.19375 11.2336 9.25 11.2917 9.25 11.3628V12.0086C9.25 12.5786 9.69844 13.042 10.25 13.042H13.75C14.3016 13.042 14.75 12.5786 14.75 12.0086V11.3628C14.75 11.2917 14.8062 11.2336 14.875 11.2336H19.875C19.9438 11.2336 20 11.2917 20 11.3628Z" fill={props.iconPrimary} />
        <path fillRule="evenodd" clipRule="evenodd" d="M9 6V7H5C4.44772 7 4 7.44772 4 8V10H20V8C20 7.44772 19.5523 7 19 7H15V6C15 5.44772 14.5523 5 14 5H10C9.44772 5 9 5.44772 9 6ZM14 6H10V7H14V6Z" fill={props.iconPrimary} fillOpacity="0.7" />
    </g>

export const viewBox = '0 0 24 24';