import classnames from 'classnames';
import { Layout } from '~components/layout';
import { DialogContainer } from '~containers/dialog';
import { LoadingContainer } from '~containers/loading';
import { Header, ViewSwitch } from '~containers-v2/header';
import { FixedAspectRatioRootBox } from '~containers/root-box';
import { SceneSwitch } from '~containers/scene-switch';
import { ToastContainer } from '~containers/toast';
import Room from '../room';
import ShapeSvg from '~containers-v2/pretest/assets/shape.svg';
import './index.css';
import { GridView } from '~containers-v2/grid-view';

import { CameraDropdown, ChatTool, MicDropdown, Quit, RosterTool, ScreenShareTool } from '../../containers-v2/hocs';


export const StudyRoomScenario = () => {
    // layout
    const layoutCls = classnames('edu-room', 'fcr-study-room');
    return (
        <Room>
            <FixedAspectRatioRootBox unset>
                <SceneSwitch>
                    <Layout className={layoutCls} direction="col">
                        <div className='fcr-grid-view-switch-content flex justify-between items-center'
                            style={{ padding: '10px 30px' }}
                        >
                            <Header />
                            <ViewSwitch />
                        </div>
                        <img src={ShapeSvg} className="fixed top-0 right-0" style={{ zIndex: -1 }} />
                        {/* streams */}
                        <div className='fcr-grid-view-content w-full flex-grow' style={{ padding: '10px 30px' }}>
                            <GridView />
                        </div>
                        {/* control bar */}
                        <div className='fcr-control-bar flex justify-between z-20' style={{ padding: '10px 30px' }}>
                            {/* device control */}
                            <div className='fcr-control-bar-device-control flex' style={{ width: 200, gap: 12 }}>
                                <CameraDropdown />
                                <MicDropdown />
                            </div>
                            {/* tools */}
                            <div className='fcr-control-bar-tools flex' style={{ gap: 12 }}>
                                <ScreenShareTool />
                                <ChatTool />
                                <RosterTool />
                            </div>
                            {/* exit */}
                            <div className='fcr-control-settings flex justify-end' style={{ width: 200, gap: 12 }}>
                                <Quit />
                            </div>
                        </div>
                    </Layout>
                    {/* <WidgetContainer /> */}
                    <ToastContainer />
                    <DialogContainer />
                    <LoadingContainer />
                </SceneSwitch>
            </FixedAspectRatioRootBox>
        </Room >
    );
};
