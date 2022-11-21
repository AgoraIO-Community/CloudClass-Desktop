import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <>
    <g opacity="0.8" filter="url(#filter0_b_473_6866)">
      <rect width="40" height="40" rx="14" fill="#8A8A8A" fillOpacity="0.1" />
    </g>
    <g clipPath="url(#clip0_473_6866)">
      <rect
        x="13.5833"
        y="25.3359"
        width="16.6209"
        height="1.52822"
        rx="0.764111"
        transform="rotate(-45 13.5833 25.3359)"
        fill="black"
      />
      <rect
        x="14.6641"
        y="13.5833"
        width="16.6209"
        height="1.52822"
        rx="0.764111"
        transform="rotate(45 14.6641 13.5833)"
        fill="black"
      />
    </g>
    <defs>
      <filter
        id="filter0_b_473_6866"
        x="-50"
        y="-50"
        width="140"
        height="140"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feGaussianBlur in="BackgroundImageFix" stdDeviation="25" />
        <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_473_6866" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_backgroundBlur_473_6866"
          result="shape"
        />
      </filter>
      <clipPath id="clip0_473_6866">
        <rect width="14" height="14" fill="white" transform="translate(13 13)" />
      </clipPath>
    </defs>
  </>
);

export const viewBox = '0 0 40 40';
