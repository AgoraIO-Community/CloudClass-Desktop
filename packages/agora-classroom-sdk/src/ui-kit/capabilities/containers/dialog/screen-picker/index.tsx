import classnames from 'classnames';
import { FC, useMemo, useState } from 'react';
import { BaseProps } from '~ui-kit/components/util/type';
import { Button, Modal, SvgIconEnum, SvgImg, useI18n } from '~ui-kit';
import './index.css';
import { useStore } from '@/infra/hooks/ui-store';
import { AGScreenShareDevice } from 'agora-rte-sdk';
import { transI18n } from '~ui-kit';

export const ScreenPickerDialog = ({
  id,
  onOK,
  onCancel,
  windowList,
  desktopList,
}: {
  id: string;
  onOK?: (id: string) => void;
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
        onOK={() => {
          removeDialog(id);
          onOK && onOK(activeId);
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
  onOK?: () => void;
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
            onClick={onOK}
            action="ok"
            disabled={currentActiveId === ''}>
            {t('fcr_share_title_share_window')}
          </Button>
        </div>
      </div>
    </>
  );
};
