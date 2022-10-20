import { useStore } from '@/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import { FC, useCallback } from 'react';
import tw, { styled } from 'twin.macro';
import { AButton as Button, CheckBox, transI18n } from '~ui-kit';

export const Footer: FC<{ onOK: () => void; visibleMirror: boolean }> = observer(
  ({ onOK, visibleMirror }) => {
    const {
      pretestUIStore: { setMirror, isMirror },
    } = useStore();
    const handleJoinClassroom = useCallback(() => {
      onOK();
    }, []);
    return (
      <FooterContainer>
        {visibleMirror && (
          <MediaMirror>
            <CheckBox
              checked={isMirror}
              onChange={(e) => {
                setMirror((e.target as any).checked);
              }}
            />
            <span className="camera-mode">{transI18n('media.mirror')}</span>
          </MediaMirror>
        )}
        <AButton type="primary" onClick={handleJoinClassroom}>
          {transI18n('pretest.finishTest')}
        </AButton>
      </FooterContainer>
    );
  },
);

const FooterContainer = styled.div`
  height: 90px;
  display: flex;
  padding: 0 28px;
  border-top: 1px solid #dceafe;
  ${tw`border-divider`};
  align-items: center;
  position: relative;
`;

const MediaMirror = styled.span`
  display: flex;
  align-items: center;
  position: absolute;
  left: 28px;
  ${tw`text-level1`};
`;

const AButton = styled(Button)`
  width: 200px;
  height: 50px;
  border-radius: 24px !important;
  background: #0056fd;
  border-color: transparent;
  position: absolute;
  right: 33px;
  color: #fff;
`;
