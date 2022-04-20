import { observer } from 'mobx-react';
import React, { useCallback, useMemo } from 'react';
// import root from 'react-shadow';
import { useStore } from '~hooks/use-edu-stores';
import { ExtAppTrack } from '~containers/root-box';
import { Modal } from './modal';
import { escapeExtAppIdentifier } from 'agora-edu-core';

const UntrackExtApp = ({ minWidth, children }: any) => {
  return (
    <div
      className="untrack-extapp-container"
      style={{ width: minWidth, maxWidth: '100vw', maxHeight: '90vh' }}>
      {children}
    </div>
  );
};

const ExtensionApp = ({ extApp, canClose, canDrag, onClose, onResize }: any) => {
  const { customHeader, appName, appIdentifier, minHeight, minWidth } = extApp;

  const handleCancel = useCallback(() => {
    onClose(extApp.appIdentifier, true);
  }, [onClose, extApp.appIdentifier]);

  const handleResize = useCallback(
    ({ width, height }: { width: number; height: number }) => {
      onResize(appIdentifier, width, height);
    },
    [appIdentifier],
  );
  // use memo to prevent unnecessary ref callback which may cause bugs
  const appContainer = useMemo(
    () => <div className="h-full w-full overflow-hidden" ref={(dom) => extApp.render(dom)}></div>,
    [extApp],
  );

  const Trackable = useMemo(
    () => (extApp.trackPath ? ExtAppTrack : UntrackExtApp),
    [extApp.trackPath],
  );

  return (
    <Trackable
      trackId={escapeExtAppIdentifier(appIdentifier)}
      minHeight={extApp.minHeight}
      minWidth={extApp.minWidth}
      draggable={true}
      resizable={false}
      controlled={canDrag}
      cancel=".modal-title-close"
      boundaryName="extapp-track-bounds"
      handle="modal-title">
      <Modal
        className="extapp-track-modal"
        title={appName}
        onCancel={handleCancel}
        closable={canClose}
        onResize={handleResize}
        minHeight={minHeight}
        minWidth={minWidth}
        header={customHeader}>
        {/* <root.section> */}
        {appContainer}
        {/* </root.section> */}
      </Modal>
    </Trackable>
  );
};

//
export const ExtensionAppContainer = observer(() => {
  const { extesionAppUIStore } = useStore();

  const { canClose, canDrag, shutdownApp, activeApps, updateTrackState } = extesionAppUIStore;

  return (
    <React.Fragment>
      {activeApps.map((extApp) => (
        <ExtensionApp
          key={extApp.appIdentifier}
          extApp={extApp}
          canClose={canClose}
          canDrag={canDrag}
          onClose={shutdownApp}
          onResize={updateTrackState}
        />
      ))}
    </React.Fragment>
  );
});
