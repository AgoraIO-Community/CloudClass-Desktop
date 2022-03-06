import classnames from 'classnames';
import { FC, useState } from 'react';
import { BaseProps } from '~ui-kit/components/interface/base-props';
import { Button, Modal, SvgImg, t } from '~ui-kit';
import './index.css';
import { useStore } from '~hooks/use-edu-stores';
import { AGScreenShareDevice } from 'agora-rte-sdk';

export const ScreenPickerDialog = ({
  id,
  onOK,
  onCancel,
  items,
}: {
  id: string;
  onOK?: (id: string) => void;
  onCancel?: () => void;
  items: (AGScreenShareDevice & { imagebase64: string })[];
}) => {
  const { shareUIStore } = useStore();
  const { removeDialog } = shareUIStore;

  const [activeId, setActiveId] = useState<string>('');

  return (
    <Modal
      id={id}
      style={{ width: 662 }}
      onOk={() => {
        removeDialog(id);
        onOK && onOK(activeId);
      }}
      onCancel={() => {
        removeDialog(id);
        onCancel && onCancel();
      }}
      footer={[
        <Button key="cancel" type={'secondary'} action="cancel">
          {t('toast.cancel')}
        </Button>,
        <Button key="ok" type={'primary'} action="ok" disabled={!activeId}>
          {t('toast.confirm')}
        </Button>,
      ]}
      title={t('toast.screen_share')}>
      <ScreenPicker currentActiveId={activeId} onActiveItem={setActiveId} items={items} />
    </Modal>
  );
};

export interface ScreenPickerProps extends BaseProps {
  screenShareTitle?: string;
  scrollHeight?: number;
  items?: (AGScreenShareDevice & { imagebase64: string })[];
  onActiveItem: (id: string) => void;
  currentActiveId?: string;
}

export const ScreenPicker: FC<ScreenPickerProps> = ({
  screenShareTitle,
  scrollHeight = 250,
  items = [],
  className,
  currentActiveId,
  onActiveItem,
}) => {
  const cls = classnames({
    [`screen-share sub-title`]: 1,
    [`${className}`]: !!className,
  });

  return (
    <>
      <div className={cls}>{screenShareTitle}</div>
      <div className={'programs'} style={{ maxHeight: scrollHeight }}>
        {items.map((item) => {
          return (
            <div
              className={'program-item'}
              key={JSON.stringify(item.id)}
              style={{
                borderColor: item.id === currentActiveId ? '#357BF6' : '#E8E8F2',
              }}
              onClick={() => {
                onActiveItem(item.id!);
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
                  <SvgImg type="checked" size={16} style={{ color: '#357BF6' }} />
                ) : (
                  ''
                )}
                <div className="title-text">{item.title}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
