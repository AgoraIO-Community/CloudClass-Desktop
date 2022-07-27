import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = ({ iconPrimary, penColor }: PathOptions) =>
    <g fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M6.77352 19.2235C6.74618 19.1414 6.74621 19.0527 6.77361 18.9706L8.28985 14.4288L11.8247 17.9636L7.2794 19.4767C7.0698 19.5465 6.84331 19.4331 6.77352 19.2235Z" fill={penColor ?? iconPrimary} />
        <path fillRule="evenodd" clipRule="evenodd" d="M8.99482 12.3053L10.7645 7.00295L12.1787 5.58874C12.5692 5.19821 13.2024 5.19821 13.5929 5.58874L20.664 12.6598C21.0545 13.0503 21.0545 13.6835 20.664 14.074L19.2497 15.4882L13.9446 17.255L8.99482 12.3053Z" fill={iconPrimary} />
        <path fillRule="evenodd" clipRule="evenodd" d="M7.99876 7.46038C8.00915 7.47762 2.06571 7.4662 2.06571 7.4662C2.04451 7.4662 4.92757 2.50006 4.92757 2.50006C4.93796 2.48282 7.99876 7.46038 7.99876 7.46038Z" stroke={penColor ?? iconPrimary} />
    </g>


export const viewBox = '0 0 22 24';
