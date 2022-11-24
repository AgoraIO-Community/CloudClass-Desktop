import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) =>
    <g fill="none">
        <path d="M20.7396 19L20.8859 18.8746C21.04 18.7426 21.1334 18.6626 20.5146 16.0805C19.4424 11.611 15.1882 8.72586 10.425 8.29498V5L3 10.7662L10.425 16.5324V13.2374C13.5112 13.0037 16.2242 13.2728 18.0398 15.2231C18.9363 16.186 20.0166 18.0939 20.2753 18.6561C20.3119 18.7351 20.3796 18.8817 20.5426 18.9371L20.7396 19Z" fill={props.iconPrimary} />
    </g>


export const viewBox = '0 0 24 24';