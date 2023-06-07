import React from 'react';

import { PathOptions } from '../svg-dict';

export const path = (props: PathOptions) => (
  <path
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    clipRule="evenodd"
    d="M14 5.83333C12.067 5.83333 10.5 7.40034 10.5 9.33334V14C10.5 15.933 12.067 17.5 14 17.5C15.933 17.5 17.5 15.933 17.5 14V9.33333C17.5 7.40034 15.933 5.83333 14 5.83333ZM9.56672 12.25C9.56672 11.799 9.20109 11.4333 8.75006 11.4333C8.29902 11.4333 7.93339 11.799 7.93339 12.25V14C7.93339 17.0534 10.1891 19.5799 13.1251 20.004V20.4167H11.3167C10.8657 20.4167 10.5001 20.7823 10.5001 21.2333C10.5001 21.6844 10.8657 22.05 11.3167 22.05H16.6834C17.1344 22.05 17.5001 21.6844 17.5001 21.2333C17.5001 20.7823 17.1344 20.4167 16.6834 20.4167H14.8751V20.004C17.811 19.5799 20.0667 17.0534 20.0667 14V12.25C20.0667 11.799 19.7011 11.4333 19.2501 11.4333C18.799 11.4333 18.4334 11.799 18.4334 12.25V14C18.4334 16.4484 16.4485 18.4333 14.0001 18.4333C11.5516 18.4333 9.56672 16.4484 9.56672 14V12.25Z"
    fill="white"
  />
);

export const viewBox = '0 0 28 28';