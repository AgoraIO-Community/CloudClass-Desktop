import { useStore } from '@/infra/hooks/use-edu-stores';
import { HostingSceneVideo } from '@/ui-kit/capabilities/containers/hosting-scene-video';
import cls from 'classnames';
import { observer } from 'mobx-react';
import { Helmet } from 'react-helmet';
import { DialogContainer } from '~containers/dialog';
import { ExtensionAppContainer } from '~containers/extension-app-container';
import { ToastContainer } from '~containers/toast';
import { ChatWidgetH5 } from '~containers/widget/chat-widget';
import Room from '../../room';
import { DocTitle } from '../components/doc-title';
import './index.css';

export const HostingClassScenario = observer(() => {
  const { streamUIStore } = useStore();
  return (
    <Room>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
        />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="black" name="apple-mobile-web-app-status-bar-style" />
        <meta content="telephone=no" name="format-detection" />
      </Helmet>
      <DocTitle />
      <div className="m-vocational-class">
        <div className="main-section">
          <HostingSceneVideo />
        </div>
        <div
          className={cls({
            'im-section': 1,
            'with-podiums': streamUIStore.studentStreams.size > 0,
          })}>
          <ChatWidgetH5 visibleEmoji={true} />
        </div>
      </div>
      <DialogContainer />
      <ToastContainer />
      <ExtensionAppContainer />
    </Room>
  );
});
