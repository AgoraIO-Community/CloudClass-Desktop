import classnames from 'classnames';
import { Layout } from '@classroom/ui-kit/components/layout';
import { DialogContainer } from '@classroom/infra/capabilities/containers/dialog';
import { HandsUpContainer } from '@classroom/infra/capabilities/containers/hand-up';
import { LoadingContainer } from '@classroom/infra/capabilities/containers/loading';
import { NavigationBar } from '@classroom/infra/capabilities/containers/nav';
import { FixedAspectRatioRootBox } from '@classroom/infra/capabilities/containers/root-box/fixed-aspect-ratio';
import { RoomBigTeacherStreamContainer } from '@classroom/infra/capabilities/containers/stream/room-big-player';
import { ToastContainer } from '@classroom/infra/capabilities/containers/toast';
import { Float } from '@classroom/ui-kit';
import { SceneSwitch } from '../../containers/scene-switch';
import { ScenesController } from '../../containers/scenes-controller';
import { ScreenShareContainer } from '../../containers/screen-share';
import { WhiteboardToolbar } from '../../containers/toolbar';
import { WidgetContainer } from '../../containers/widget';
import { Chat, Watermark, Whiteboard } from '../../containers/widget/slots';
import { BigClassAside as Aside } from '@classroom/infra/capabilities/containers/aside';
import Room from '../room';
import { StreamWindowsContainer } from '../../containers/stream-window';
import { EduClassroomConfig, EduRoleTypeEnum } from 'agora-edu-core';
import { RecordPlayer } from '../../containers/record-player';

export const BigClassScenario = () => {
  // layout
  const layoutCls = classnames('edu-room', 'big-class-room');

  const isInvisible = EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.invisible;
  const isTeacher =
    EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.teacher ||
    EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.assistant;
  const isStudent = EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.student;

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: 27 }}>
        <SceneSwitch>
          <Layout className={layoutCls} direction="col">
            {/* 录制隐藏导航栏 */}
            {!isInvisible && <NavigationBar />}
            <Layout className="flex-grow items-stretch fcr-room-bg h-full">
              <Layout
                className="flex-grow items-stretch relative"
                direction="col"
                style={{ paddingTop: 2 }}>
                {/* 学生隐藏白板 */}
                {!isStudent && <Whiteboard />}
                {/* 学生显示录制视频 */}
                {isStudent && <RecordPlayer />}
                <ScreenShareContainer />
                <WhiteboardToolbar />
                <ScenesController />
                {/* 录制隐藏举手图标 */}
                {!isInvisible && (
                  <Float bottom={15} right={10} align="flex-end" gap={2}>
                    <HandsUpContainer />
                  </Float>
                )}
                {/* 学生隐藏浮窗 */}
                {!isStudent && <StreamWindowsContainer />}
              </Layout>
              {/* 录制隐藏侧边栏 */}
              {isTeacher && (
                <Aside>
                  <RoomBigTeacherStreamContainer />
                  <Chat />
                </Aside>
              )}
              {/* 学生仅显示聊天 */}
              {isStudent && (
                <Aside>
                  <Chat />
                </Aside>
              )}
              {/* 录制右上角显示老师视频 */}
              {isInvisible && (
                <div style={{ position: 'absolute', right: 0, top: 0 }}>
                  <RoomBigTeacherStreamContainer />
                </div>
              )}
            </Layout>
            <DialogContainer />
            <LoadingContainer />
          </Layout>
          <WidgetContainer />
          <ToastContainer />
          <Watermark />
        </SceneSwitch>
      </FixedAspectRatioRootBox>
    </Room>
  );
};
