import { HostingSceneVideo } from '@classroom/infra/capabilities/scenarios/vocational-class/hosting-scene/hosting-scene-video';
import { WidgetContainer } from '@classroom/infra/capabilities/containers/widget';
import { observer } from 'mobx-react';
import { DialogContainer } from '@classroom/infra/capabilities/containers/dialog';
import { ToastContainer } from '@classroom/infra/capabilities/containers/toast';
import Room from '../../room';
import { ChatH5 } from '../components/chat';
import { DocTitle } from '../components/doc-title';
import { PageHeader } from '../components/page-header';
import { Watermark } from '@classroom/infra/capabilities/containers/widget/slots';

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
      <Watermark />
      <ToastContainer />
    </Room>
  );
});
