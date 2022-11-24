

import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = ({ iconPrimary, penColor }: PathOptions) =>
    <g fill="none" >
        <path fillRule="evenodd" clipRule="evenodd" d="M6.77352 19.2235C6.74618 19.1414 6.74621 19.0527 6.77361 18.9706L8.28985 14.4288L11.8247 17.9636L7.2794 19.4767C7.0698 19.5465 6.84331 19.4331 6.77352 19.2235Z" fill={penColor ?? iconPrimary} />
        <path fillRule="evenodd" clipRule="evenodd" d="M8.99482 12.3053L10.7645 7.00295L12.1787 5.58874C12.5692 5.19821 13.2024 5.19821 13.5929 5.58874L20.664 12.6598C21.0545 13.0503 21.0545 13.6835 20.664 14.074L19.2497 15.4882L13.9446 17.255L8.99482 12.3053Z" fill={iconPrimary} />
        <path d="M8 2V4.07489L7.19853 3.24369L2.43903 7.92598C2.33482 8.02849 2.17021 8.02397 2.07137 7.91588C1.98242 7.8186 1.97705 7.67058 2.05284 7.56722L2.0811 7.53455L6.83044 2.86191L5.99949 2H8Z" fill={penColor ?? iconPrimary} stroke={penColor ?? iconPrimary} strokeWidth="0.4" />
    </g>


export const viewBox = '0 0 22 24';
