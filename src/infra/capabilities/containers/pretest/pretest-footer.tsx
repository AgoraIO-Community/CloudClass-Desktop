import { useStore } from '@classroom/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { FC, useCallback } from 'react';
import { AButton as Button, CheckBox } from '@classroom/ui-kit';
import { useI18n } from 'agora-common-libs';

export const Footer: FC<{ onOK: () => void; visibleMirror: boolean }> = observer(
  ({ onOK, visibleMirror }) => {
    const {
      pretestUIStore: { setMirror, isMirror },
    } = useStore();
    const handleJoinClassroom = useCallback(() => {
      onOK();
    }, []);
    const transI18n = useI18n();
    return (
      <div
        className="fcr-flex fcr-items-center fcr-justify-between fcr-relative fcr-border-divider"
        style={{
          height: 90,
          padding: '0 28px',
          borderTopWidth: '1px',
          borderTopStyle: 'solid',
        }}>
        {visibleMirror ? (
          <span className="fcr-flex fcr-items-center fcr-text-level1">
            <CheckBox
              checked={isMirror}
              onChange={(e) => {
                setMirror(e.target.checked);
              }}
            />
            <span className="camera-mode">{transI18n('media.mirror')}</span>
          </span>
        ) : (
          <span />
        )}
        <Button
          className="fcr-text-white"
          style={{
            width: 200,
            height: 50,
            borderRadius: 24,
            background: '#0056fd',
            borderColor: 'transparent',
          }}
          type="primary"
          onClick={handleJoinClassroom}>
          {transI18n('pretest.finishTest')}
        </Button>
      </div>
    );
  },
);
