import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) =>
    <g fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M10 9.3335C7.79086 9.3335 6 11.1244 6 13.3335V18.6668C6 20.876 7.79086 22.6668 10 22.6668H16.6667C18.8758 22.6668 20.6667 20.876 20.6667 18.6668V13.3335C20.6667 11.1244 18.8758 9.3335 16.6667 9.3335H10ZM23.8917 10.8394C24.7742 10.2091 26 10.8399 26 11.9244V20.0759C26 21.1604 24.7742 21.7912 23.8917 21.1609L21.8917 19.7323C21.5413 19.482 21.3333 19.0779 21.3333 18.6473V13.353C21.3333 12.9224 21.5413 12.5183 21.8917 12.268L23.8917 10.8394Z" fill={props.iconPrimary} />
        <path d="M13 13.3335L10 14.3335" stroke="black" strokeWidth="0.666667" strokeLinecap="round" />
        <path d="M16 13.3335L18.3333 14.0002" stroke="black" strokeWidth="0.666667" strokeLinecap="round" />
        <path d="M12 16V18" stroke="black" strokeWidth="2" strokeLinecap="round" />
        <path d="M17.3333 16V17.6667" stroke="black" strokeWidth="2" strokeLinecap="round" />
        <path d="M6.66659 9.3335L5.33325 8.00016" stroke={props.iconPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21.3333 24L20 22.6667" stroke={props.iconPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>


export const viewBox = '0 0 32 32';