import classnames from 'classnames';
import { Layout } from '~components/layout';
import { DialogContainer } from '~containers/dialog';
import { LoadingContainer } from '~containers/loading';
import { NavigationBar } from '~containers/nav';
import { FixedAspectRatioRootBox } from '~containers/root-box';
import { SceneSwitch } from '~containers/scene-switch';
import { ToastContainer } from '~containers/toast';
import Room from '../room';
import { useStore } from '@/infra/hooks/ui-store';
import { WidgetContainer } from '../../containers/widget';


export const StudyRoomScenario = () => {
    // layout
    const layoutCls = classnames('edu-room', 'mid-class-room');
    const { shareUIStore } = useStore();

    return (
        <Room>
            <FixedAspectRatioRootBox trackMargin={{ top: shareUIStore.navHeight }}>
                <SceneSwitch>
                    <Layout className={layoutCls} direction="col">
                        <NavigationBar />
                        StudyRoom
                        <DialogContainer />
                        <LoadingContainer />
                    </Layout>
                    <WidgetContainer />
                    <ToastContainer />
                </SceneSwitch>
            </FixedAspectRatioRootBox>
        </Room>
    );
};
