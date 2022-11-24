import React from 'react';
import { useVocationalH5UIStores } from '@classroom/infra/hooks/ui-store';
import { transI18n } from 'agora-common-libs';
import { observer } from 'mobx-react';
import { Helmet } from 'react-helmet';

export const DocTitle = observer(() => {
  const { navigationBarUIStore } = useVocationalH5UIStores();
  const { classStatusText, isBeforeClass } = navigationBarUIStore;
  return (
    <Helmet>
      <title>
        {transI18n('home.roomType_vocationalClass')}
        {' | '}
        {isBeforeClass ? transI18n('course.pre_class') : classStatusText}
      </title>
    </Helmet>
  );
});
