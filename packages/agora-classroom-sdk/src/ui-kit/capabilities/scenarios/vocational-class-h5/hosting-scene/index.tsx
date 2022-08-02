import { HostingSceneVideo } from '@/ui-kit/capabilities/scenarios/vocational-class/hosting-scene/hosting-scene-video';
import { WidgetContainer } from '@/ui-kit/capabilities/containers/widget';
import { observer } from 'mobx-react';
import { DialogContainer } from '~containers/dialog';
import { ToastContainer } from '~containers/toast';
import Room from '../../room';
import { ChatH5 } from '../components/chat';
import { DocTitle } from '../components/doc-title';
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
        <ChatH5 />
      </div>
      <DialogContainer />
      <WidgetContainer />
      <ToastContainer />
    </Room>
  );
});
