import { HostingSceneVideo } from '@/ui-kit/capabilities/containers/hosting-scene-video';
import { WidgetContainer } from '@/ui-kit/capabilities/containers/widget';
import { observer } from 'mobx-react';
import { DialogContainer } from '~containers/dialog';
import { ToastContainer } from '~containers/toast';
import Room from '../../room';
import { DocTitle } from '../components/doc-title';
import { H5Chat } from '../components/h5-chat';
import { PageHeader } from '../components/page-header';

export const HostingClassScenario = observer(() => {
  return (
    <Room>
      <PageHeader />
      <DocTitle />
      <div className="m-vocational-class">
        <div className="main-section">
          <HostingSceneVideo />
        </div>
        <H5Chat />
      </div>
      <DialogContainer />
      <WidgetContainer />
      <ToastContainer />
    </Room>
  );
});
