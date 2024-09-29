import React from 'react';
import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
<path d="M15.75 2.25H2.25C1.4175 2.25 0.75 2.9175 0.75 3.75V14.25C0.75 15.0825 1.4175 15.75 2.25 15.75H15.75C16.5825 15.75 17.25 15.0825 17.25 14.25V3.75C17.25 2.9175 16.5825 2.25 15.75 2.25ZM15.75 14.265H2.25V3.735H15.75V14.265ZM7.5 9H6L9 6L12 9H10.5V12H7.5V9Z" fill={props.iconPrimary ? props.iconPrimary : "#84BD00"}/>
);

export const viewBox = '0 0 18 18';
