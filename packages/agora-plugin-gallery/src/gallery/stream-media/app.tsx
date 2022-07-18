import { useRef } from 'react';
import { observer } from 'mobx-react';
import { YoutubePlayer } from './players/youtube';
import { FcrStreamMediaPlayerWidget } from '.';
import { StreamMediaPlayerInterface } from './type';
import { ControlledModal } from '../../common/edu-tool-modal';

export const App = observer(({ widget }: { widget: FcrStreamMediaPlayerWidget }) => {
  const webviewRef = useRef<StreamMediaPlayerInterface>(null);

  return (
    <ControlledModal
      widget={widget}
      canRefresh={false}
      onCancel={widget.handleClose}
      onFullScreen={widget.handleFullScreen}
      title={widget.webviewTitle ?? ''}>
      {/* players determined by some flag */}
      <YoutubePlayer ref={webviewRef} widget={widget} />
    </ControlledModal>
  );
});
