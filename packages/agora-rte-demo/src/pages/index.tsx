import React from 'react';
import {DeviceDetectPage} from './device-detect';
import {
  BigClassPage,
  OneToOneRoomPage,
  SmallClassPage
} from './classroom';
import {
  MiddleRoomPage
} from './middle-class';
import '../icons.scss';
import { ReplayPage } from './replay';
import { BreakoutClassroom } from './breakout-class/breakout-class';
import { AssistantCoursesPage } from './breakout-class/assistant-courses-page';
import { HomePage } from './home';

export type AppRouteComponent = {
  path: string
  component: React.FC
}

export const routesMap: Record<string, AppRouteComponent> = {
  'setting': {
    path: '/setting',
    component: () => <DeviceDetectPage />
  },
  '1v1': {
    path: '/classroom/one-to-one',
    component: () => <OneToOneRoomPage />
  },
  'smallClass': {
    path: '/classroom/small-class',
    component: () => <SmallClassPage />
  },
  'bigClass': {
    path: '/classroom/big-class',
    component: () => <BigClassPage />
  },
  'replayPage': {
    path: '/replay/record/:roomUuid',
    component: () => <ReplayPage />
  },
  'recordPage': {
    path: '/record/:roomUuid',
    component: () => <ReplayPage />
  },
  'middleClass': {
    path: '/classroom/middle-class',
    component: () => <MiddleRoomPage />
  },
  'breakoutClassRoom': {
    path: '/classroom/breakout-class',
    component: () => <BreakoutClassroom />
  },
  'breakoutClassCourses': {
    path: '/breakout-class/assistant/courses',
    component: () => <AssistantCoursesPage />
  },
  'breakoutClassAssistantRoom': {
    path: '/breakout-class/assistant/courses/:course_name',
    component: () => <BreakoutClassroom />
  },
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
