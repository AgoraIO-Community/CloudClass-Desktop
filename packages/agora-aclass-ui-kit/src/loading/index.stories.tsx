import React from 'react';
import { Loading } from './index'

export const eductionLoading = (props: any) => {
  return (
  <div style={{height:'18px',width:'18px'}}><Loading {...props} /></div>
  );
}

export default {
  title: 'loading',
  component: eductionLoading,
  argTypes: {
    color: {
      control: 'color'
    },
  }
}
eductionLoading.args = {
  color: '#1ea7fd',
  width:'18px',
}
