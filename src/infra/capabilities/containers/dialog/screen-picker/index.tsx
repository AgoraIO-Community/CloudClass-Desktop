import classnames from 'classnames';
import { FC, useMemo, useState } from 'react';
import { BaseProps } from '@classroom/ui-kit/components/util/type';
import { Button, CheckBox, Modal, SvgIconEnum, SvgImg } from '@classroom/ui-kit';
import './index.css';
import { useStore } from '@classroom/infra/hooks/ui-store';
import { AGScreenShareDevice } from 'agora-rte-sdk';
import { transI18n, useI18n } from 'agora-common-libs';
import { DevicePlatform, getPlatform } from 'agora-edu-core';

export const ScreenPickerDialog = ({
  id,
  onOK,
  onCancel,
  windowList,
  desktopList,
}: {
  id: string;
  onOK?: (id: string, withAudio: boolean) => void;
  onCancel?: () => void;
  windowList: (AGScreenShareDevice & { imagebase64: string })[];
  desktopList: (AGScreenShareDevice & { imagebase64: string })[];
}) => {
  const { shareUIStore } = useStore();
  const t = useI18n();
  const { removeDialog } = shareUIStore;

  const [activeId, setActiveId] = useState<string>('');

  return (
    <Modal
      id={id}
      style={{ width: 662 }}
      hasMask={false}
      onCancel={() => {
        removeDialog(id);
        onCancel && onCancel();
      }}
      closable
      className="screen-picker-dialog"
      title={t('fcr_share_title_select_window_share')}>
      <ScreenPicker
        onCancel={() => {
          removeDialog(id);
          onCancel && onCancel();
        }}
        onOK={(withAudio) => {
          removeDialog(id);
          onOK && onOK(activeId, withAudio);
        }}
        currentActiveId={activeId}
        onActiveItem={setActiveId}
        windowList={windowList}
        desktopList={desktopList}
      />
    </Modal>
  );
};

export interface ScreenPickerProps extends BaseProps {
  screenShareTitle?: string;
  scrollHeight?: number;
  desktopList: (AGScreenShareDevice & { imagebase64: string })[];
  windowList: (AGScreenShareDevice & { imagebase64: string })[];
  onActiveItem: (id: string) => void;
  currentActiveId?: string;
  onOK?: (withAudio: boolean) => void;
  onCancel?: () => void;
}

export const ScreenPicker: FC<ScreenPickerProps> = ({
  screenShareTitle,
  scrollHeight = 350,
  desktopList,
  windowList,
  className,
  currentActiveId,
  onActiveItem,
  onOK,
  onCancel,
}) => {
  const cls = classnames({
    [`screen-share sub-title`]: 1,
    [`${className}`]: !!className,
  });
  const activeTitle = useMemo(() => {
    return [...windowList, ...desktopList].find((i) => currentActiveId === i.id)?.title;
  }, [currentActiveId, windowList, desktopList]);
  const t = useI18n();
  const [withAudio, setWithAudio] = useState(false);
  return (
    <>
      <div className={cls}>{screenShareTitle}</div>
      <div className="mask"></div>
      <div className={'programs'} style={{ height: scrollHeight }}>
        <div>
          <h5>{transI18n('fcr_share_title_desktop')}</h5>
          {desktopList.map((item) => {
            return (
              <div
                className={`program-item ${
                  item.id === currentActiveId ? 'program-item-active' : ''
                }`}
                key={JSON.stringify(item.id)}
                onClick={() => {
                  onActiveItem(item.id! as string);
                }}>
                <div
                  className="program-item-img"
                  style={
                    item.imagebase64
                      ? {
                          backgroundImage: `url(data:image/png;base64,${item.imagebase64})`,
                        }
                      : {}
                  }></div>
                <div className="program-item-title">
                  {item.id === currentActiveId ? (
                    <SvgImg type={SvgIconEnum.CHECKED} size={16} style={{ color: '#357BF6' }} />
                  ) : (
                    ''
                  )}
                  <div className="title-text">{item.title}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <h5>{transI18n('fcr_share_title_application')}</h5>
          {windowList.map((item) => {
            return (
              <div
                className={`program-item ${
                  item.id === currentActiveId ? 'program-item-active' : ''
                }`}
                key={JSON.stringify(item.id)}
                onClick={() => {
                  onActiveItem(item.id! as string);
                }}>
                <div
                  className="program-item-img"
                  style={
                    item.imagebase64
                      ? {
                          backgroundImage: `url(data:image/png;base64,${item.imagebase64})`,
                        }
                      : {}
                  }></div>
                <div className="program-item-title">
                  {item.id === currentActiveId ? (
                    <SvgImg type={SvgIconEnum.CHECKED} size={16} style={{ color: '#357BF6' }} />
                  ) : (
                    ''
                  )}
                  <div className="title-text">{item.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="screen-picker-footer" key="screen-picker-footer">
        {getPlatform() === DevicePlatform.WINDOWS && (
          <div className="screen-picker-footer-with-audio">
            <CheckBox
              checked={withAudio}
              onChange={(e) => {
                setWithAudio(e.target.checked);
              }}
              text={t('fcr_share_title_share_audio')}></CheckBox>
          </div>
        )}
        <div className="screen-picker-footer-text">
          {activeTitle && transI18n('fcr_share_selected', { reason: activeTitle })}
        </div>
        <div>
          <Button key="cancel" type={'secondary'} onClick={onCancel} action="cancel">
            {t('toast.cancel')}
          </Button>
          <Button
            className="screen-picker-footer-confirm-btn"
            key="ok"
            type={'primary'}
            onClick={() => onOK && onOK(withAudio)}
            action="ok"
            disabled={currentActiveId === ''}>
            {t('fcr_share_title_share_window')}
          </Button>
        </div>
      </div>
    </>
  );
};
