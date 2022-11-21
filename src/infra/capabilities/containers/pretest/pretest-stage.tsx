import { useStore } from '@classroom/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { Button, SvgImg, SvgIconEnum } from '@classroom/ui-kit';

import { useI18n } from 'agora-common-libs';

export const PretestStage = observer(() => {
  return (
    <div
      className="flex flex-grow flex-col"
      style={{
        padding: '40px 30px',
        gap: 20,
      }}>
      <StageManager />
    </div>
  );
});

const StageManager = observer(() => {
  const {
    deviceSettingUIStore: { stageVisible, setStageVisible },
  } = useStore();
  const transI18n = useI18n();
  return (
    <ItemCard>
      <ItemCardTitle> {transI18n('fcr_stage_label_title')}</ItemCardTitle>
      <div className="flex">
        <div onClick={() => setStageVisible(true)} className="cursor-pointer flex mr-4">
          <SvgImg type={stageVisible ? SvgIconEnum.PRETEST_CHECKED : SvgIconEnum.PRETEST_CHECK} />
          {transI18n('stage.visible')}
        </div>
        <div onClick={() => setStageVisible(false)} className="cursor-pointer flex">
          <SvgImg type={stageVisible ? SvgIconEnum.PRETEST_CHECK : SvgIconEnum.PRETEST_CHECKED} />
          {transI18n('stage.hidden')}
        </div>
      </div>
    </ItemCard>
  );
});

const ItemCardTitle: FC = ({ children }) => {
  return (
    <div
      className="text-level1"
      style={{
        fontWeight: 700,
        fontSize: 16,
      }}>
      {children}
    </div>
  );
};

const ItemCard: FC = ({ children }) => (
  <div
    className="flex flex-col"
    style={{
      borderRadius: 18,
      padding: 20,
      boxSizing: 'border-box',
      gap: 16,
      background: 'rgba(51, 50, 68, 0.1)',
    }}>
    {children}
  </div>
);
