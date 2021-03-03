import React from 'react';
import { HomePage } from './home';
import {Invisible} from './invisible'
import { AcadsocOneToOne } from './acadsoc';
import { Pretest } from './acadsoc/containers/pretest';
import { Setting } from './acadsoc/containers/setting';
import { LaunchPage } from './launch';
import { DownloadPage } from './download';

export type AppRouteComponent = {
  path: string
  component: React.FC
}

export const routesMap: Record<string, AppRouteComponent> = {
  'setting': {
    path: '/setting',
    // component: () => <DeviceDetectPage />
    component: () => <Setting />
  },
  '1v1': {
    path: '/classroom/one-to-one',
    component: () => <AcadsocOneToOne />
  },
  'invisibleJoinRoom': {
    path: '/invisible/courses',
    component: () => <Invisible />
  },
  'aClass': {
    path: '/acadsoc/one-to-one',
    component: () => <AcadsocOneToOne />
  },
  // TODO: acadsoc主页
  'launch': {
    path: '/acadsoc/launch',
    component: () => <LaunchPage />
  },
  'downloadStorage': {
    path: '/download',
    component: () => <DownloadPage />
  },
  'pretest': {
    path: '/pretest',
    component: () => <Pretest />
  },
  // 'config': {
  //   path: 'config',
  //   component: () => <Pretest />
  // },
  'home': {
    path: '/',
    // component: () => <div>hello</div>
    component: () => <HomePage />
  }
}

// export interface AppProps {
//   basename: string
// }

// const parser = new UAParser();

// const userAgentInfo = parser.getResult();

// const isMobile = () => {
//   return userAgentInfo.device.type === 'mobile';
// };

// if (isMobile() && document) {
//   const el = document.createElement('div');
//   document.body.appendChild(el);
  
//   Eruda.init({
//     container: el,
//     tool: ['console', 'elements']
//   });
// }

// export function App (props: AppProps) {
//   return (
//     <Provider store={defaultStore}>
//       <ThemeContainer>
//         <HashRouter basename={props.basename}>
//           <Loading />
//           <Toast />
//           <ConfirmDialog />
//           <Switch>
//           <Route path="/setting">
//             <DeviceDetectPage />
//           </Route>
//           <Route path="/classroom/one-to-one">
//             <RoomPage >
//               <OneToOne />
//             </RoomPage>
//           </Route>
//           <Route path="/classroom/small-class">
//             <RoomPage>
//               <SmallClass />
//             </RoomPage>
//           </Route>
//           <Route path="/classroom/big-class">
//             <RoomPage>
//               <BigClass />
//             </RoomPage>
//           </Route>
//           <Route path="/classroom/middle-class">
//             <MiddleRoomPage>
//               <MiddleClass />
//             </MiddleRoomPage>
//           </Route>
//           <Route path="/breakout-class/assistant/courses/:course_name">
//             <BreakoutClassroom />
//           </Route>
//           <Route path="/breakout-class/assistant/courses">
//             <AssistantCoursesPage />
//           </Route>
//           <Route path="/classroom/breakout-class">
//             <BreakoutClassroom />
//           </Route>
//           <Route path="/replay/record/:roomUuid">
//             <ReplayPage />
//           </Route>
//           <Route path="/">
//             <Home />
//           </Route>
//           </Switch>
//         </HashRouter>
//       </ThemeContainer>
//     </Provider>
//   )
// }
