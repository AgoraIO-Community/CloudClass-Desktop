import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = ({ iconPrimary, penColor }: PathOptions) =>
    <g fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M6.77352 19.2235C6.74618 19.1414 6.74621 19.0527 6.77361 18.9706L8.28985 14.4288L11.8247 17.9636L7.2794 19.4767C7.0698 19.5465 6.84331 19.4331 6.77352 19.2235Z" fill={penColor ?? iconPrimary} />
        <path fillRule="evenodd" clipRule="evenodd" d="M8.99482 12.3053L10.7645 7.00295L12.1787 5.58874C12.5692 5.19821 13.2024 5.19821 13.5929 5.58874L20.664 12.6598C21.0545 13.0503 21.0545 13.6835 20.664 14.074L19.2497 15.4882L13.9446 17.255L8.99482 12.3053Z" fill={iconPrimary} />
        <path fillRule="evenodd" clipRule="evenodd" d="M5 2L7.97678 4.94394C7.99226 4.95942 8 4.97971 8 5C8 5.02029 7.99226 5.04058 7.97678 5.05606V5.05606L5.05606 7.97678C5.04058 7.99226 5.02029 8 5 8C4.97971 8 4.95942 7.99226 4.94394 7.97678V7.97678L2.02322 5.05606C2.00774 5.04058 2 5.02029 2 5C2 4.97971 2.00774 4.95942 2.02322 4.94394V4.94394L4.94394 2.02322C4.95942 2.00774 4.97971 2 5 2V2Z" stroke={penColor ?? iconPrimary} />
    </g>


export const viewBox = '0 0 22 24';
