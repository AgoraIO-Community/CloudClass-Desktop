import { observer } from 'mobx-react';
import React, { useCallback, useMemo } from 'react';
import { IAgoraExtApp, escapeExtAppIdentifier } from 'agora-edu-core';
import { Modal } from './modal';
import { useStore } from '~hooks/use-edu-stores';
import { Track } from '~containers/root-box';

type ExtAppProps = {
  extApp: IAgoraExtApp;
  canClose: boolean;
  canDrag: boolean;
  onClose: (appId: string) => void;
  onResize: (appId: string, width: number, height: number) => void;
  mount: (dom: HTMLDivElement | null, extApp: IAgoraExtApp) => void;
};

const ExtApp = ({ extApp, canClose, onClose, onResize, canDrag, mount }: ExtAppProps) => {
  const { customHeader, appName, appIdentifier, minHeight, minWidth } = extApp;

  const handleCancel = useCallback(() => {
    onClose(extApp.appIdentifier);
  }, [onClose, extApp.appIdentifier]);

  const handleResize = useCallback(
    ({ width, height }) => {
      onResize(appIdentifier, width, height);
    },
    [appIdentifier],
  );
  // use memo to prevent unnecessary ref callback which may cause bugs
  const appContainer = useMemo(
    () => <div className="h-full w-full overflow-hidden" ref={(dom) => mount(dom, extApp)}></div>,
    [extApp],
  );

  return (
    <Track
      trackId={escapeExtAppIdentifier(appIdentifier)}
      minHeight={extApp.minHeight}
      minWidth={extApp.minWidth}
      draggable={true}
      resizable={false}
      controlled={canDrag}
      cancel=".modal-title-close">
      <Modal
        title={appName}
        onCancel={handleCancel}
        closable={canClose}
        onResize={handleResize}
        minHeight={minHeight}
        minWidth={minWidth}
        header={customHeader}>
        {appContainer}
      </Modal>
    </Track>
  );
};

export const ExtAppContainer = observer(() => {
  const { extAppUIStore } = useStore();

  const { canClose, canDrag, shutdownApp, activeApps, updateAppTrack, mount } = extAppUIStore;

  return (
    <React.Fragment>
      {activeApps.map((extApp) => (
        <ExtApp
          key={extApp.appIdentifier}
          extApp={extApp}
          canClose={canClose}
          canDrag={canDrag}
          onClose={shutdownApp}
          onResize={updateAppTrack}
          mount={mount}
        />
      ))}
    </React.Fragment>
  );
});
