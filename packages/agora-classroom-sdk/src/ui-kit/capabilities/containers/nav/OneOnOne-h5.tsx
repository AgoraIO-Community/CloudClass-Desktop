import React from 'react';
import { useStore } from '~hooks/use-edu-stores';
import { Header } from '~ui-kit';
import { ClassStatusComponent } from '.';

export const OneOnOneH5NavgationBarContainer = () => {
  const { navigationBarUIStore } = useStore();
  const { navigationTitle } = navigationBarUIStore;

  return (
    <Header className="biz-header justify-center">
      <div className="biz-header-title-wrap">
        <div className="biz-header-title">{navigationTitle}</div>
        <div className="biz-header-title biz-subtitle">
          <ClassStatusComponent />
        </div>
      </div>
    </Header>
  );
};
