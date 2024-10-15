import React from 'react';
import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <path d="M9 2.25L0.75 6.75L3.75 8.385V12.885L9 15.75L14.25 12.885V8.385L15.75 7.5675V12.75H17.25V6.75L9 2.25ZM14.115 6.75L9 9.54L3.885 6.75L9 3.96L14.115 6.75ZM12.75 11.9925L9 14.04L5.25 11.9925V9.2025L9 11.25L12.75 9.2025V11.9925Z" fill={props.iconPrimary ? props.iconPrimary : 'white'}/>
);

export const viewBox = '0 0 18 18';
