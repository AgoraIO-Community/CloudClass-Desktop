import React from 'react';
import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <g>
    <defs>
      <filter
        x="-22.5%"
        y="-20.8%"
        width="145.0%"
        height="141.5%"
        filterUnits="objectBoundingBox"
        id="filter-1">
        <feOffset dx="0.4" dy="0.4" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
        <feGaussianBlur
          stdDeviation="0.5"
          in="shadowOffsetOuter1"
          result="shadowBlurOuter1"></feGaussianBlur>
        <feColorMatrix
          values="0 0 0 0 0.0509803922   0 0 0 0 0.11372549   0 0 0 0 0.239215686  0 0 0 0.395977314 0"
          type="matrix"
          in="shadowBlurOuter1"
          result="shadowMatrixOuter1"></feColorMatrix>
        <feMerge>
          <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
          <feMergeNode in="SourceGraphic"></feMergeNode>
        </feMerge>
      </filter>
    </defs>
    <g id="页面-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="灵动课堂Guide-图标和图片（补充）" transform="translate(-597.000000, -204.000000)">
        <g id="视频区-授权icon-开启状态" transform="translate(597.000000, 204.000000)">
          <rect id="矩形" x="0" y="0" width="18" height="18"></rect>
          <g
            id="授权（视频区icon）"
            filter="url(#filter-1)"
            transform="translate(3.000000, 2.500000)"
            fill={props.iconPrimary}
            fillRule="nonzero">
            <g id="皇冠3备份">
              <path
                d="M10.0721421,11.0619034 C10.2802442,11.0619034 10.472697,11.1762486 10.5769145,11.3623751 C10.6810619,11.5469321 10.6810619,11.7791222 10.5769145,11.9636792 C10.472697,12.1494451 10.2805771,12.2641509 10.0721421,12.2641509 L1.91453941,12.2641509 C1.59289679,12.2641509 1.33185349,11.995061 1.33185349,11.6628468 C1.33185349,11.3309933 1.59289678,11.0619034 1.91453941,11.0619034 L10.0721421,11.0619034 Z M5.99323496,3.80140364e-13 C6.16271331,3.80140364e-13 6.32320166,0.0807991128 6.43174772,0.2200333 L8.95727492,3.47075472 L11.0992283,1.9391787 C11.2931095,1.80095394 11.5446473,1.80237617 11.7371861,1.94278579 C11.929306,2.08310211 12.0228687,2.33451721 11.9735901,2.57835738 L10.5465091,9.61761932 C10.4881895,9.90029729 10.2561651,10.1009349 9.98879545,10.0998971 L1.99767447,10.0998971 C1.73030479,10.1009349 1.49828045,9.90029729 1.43996083,9.61761932 L0.0128797983,2.57835738 C-0.0361833282,2.33401803 0.0575520014,2.08201082 0.2492838,1.94278579 C0.441822607,1.80237617 0.693360427,1.80095394 0.887241617,1.9391787 L3.02919501,3.47075472 L5.5547222,0.2200333 C5.66360122,0.0807991128 5.82375661,3.80140364e-13 5.99323496,3.80140364e-13 Z M6,5 C5.17157288,5 4.5,5.67157288 4.5,6.5 C4.5,7.32842712 5.17157288,8 6,8 C6.82842712,8 7.5,7.32842712 7.5,6.5 C7.5,5.67157288 6.82842712,5 6,5 Z"
                id="形状结合"></path>
            </g>
          </g>
        </g>
      </g>
    </g>
  </g>
);
export const viewBox = '0 0 18 18';
