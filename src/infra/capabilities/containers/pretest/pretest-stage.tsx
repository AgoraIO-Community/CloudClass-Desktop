import { useStore } from '@classroom/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { FC, PropsWithChildren } from 'react';
import { SvgImg, SvgIconEnum } from '@classroom/ui-kit';

import { useI18n } from 'agora-common-libs';

export const PretestStage = observer(() => {
  return (
    <div
      className="fcr-flex fcr-flex-grow fcr-flex-col"
      style={{
        padding: '60px 30px 40px',
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
      <div className="fcr-flex">
        <div onClick={() => setStageVisible(true)} className="fcr-text-level1 fcr-cursor-pointer fcr-flex fcr-mr-4">
          <SvgImg type={stageVisible ? SvgIconEnum.PRETEST_CHECKED : SvgIconEnum.PRETEST_CHECK} />
          {transI18n('stage.visible')}
        </div>
        <div onClick={() => setStageVisible(false)} className="fcr-text-level1 fcr-cursor-pointer fcr-flex">
          <SvgImg type={stageVisible ? SvgIconEnum.PRETEST_CHECK : SvgIconEnum.PRETEST_CHECKED} />
          {transI18n('stage.hidden')}
        </div>
      </div>
    </ItemCard>
  );
});

const ItemCardTitle: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className="fcr-text-level1"
      style={{
        fontWeight: 700,
        fontSize: 16,
      }}>
      {children}
    </div>
  );
};

const ItemCard: FC<PropsWithChildren> = ({ children }) => (
  <div
    className="fcr-flex fcr-flex-col"
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
