import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <path
    d="M14.522 13.1083L11.0928 18.2521C10.544 19.0753 9.26086 18.6866 9.26086 17.6972L9.26087 6.30277C9.26087 5.31337 10.5441 4.92484 11.0929 5.74808L14.5213 10.8906C14.9691 11.5624 14.9698 12.4365 14.522 13.1083Z"
    fill={props.iconPrimary}
  />
);

export const viewBox = '0 0 24 24';
