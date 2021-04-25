import { AppRouteComponent, routesMap } from "@/infra/router"
import { HomeStore } from "@/infra/stores/app/home"
import { BizPageRouter } from "@/infra/types"
import { ToastContainer } from "@/ui-kit/capabilities/containers/toast"
import { AppPluginContainer } from "@/ui-kit/capabilities/containers/ext-app"
import { AppStoreConfigParams, AppStoreInitParams, useStorageSWContext } from 'agora-edu-core'
import {I18nProvider} from '~ui-kit'
import { RoomParameters } from '../api/declare'
import { Provider } from "mobx-react"
import { HashRouter, MemoryRouter, Redirect, Route, Switch } from "react-router-dom"

export interface RouteContainerProps {
  routes: BizPageRouter[];
  mainPath?: string;
  inRoom?: boolean;
}

export interface AppContainerProps extends RouteContainerProps {
  basename?: string;
  store: HomeStore;
}

export interface RoomContainerProps extends RouteContainerProps {
  basename?: string;
  store: any;
}

type AppContainerComponentProps = Omit<AppContainerProps, 'defaultStore'>

export const RouteContainer = (props: RouteContainerProps) => {

  const routes = props.routes
    .filter((path: string) => routesMap[path])
    .reduce((acc: AppRouteComponent[], item: string) => {
    acc.push(routesMap[item])
    return acc
  }, [])
  
  return (
    <>
      <Switch>
      {
        routes.map((item, index) => (
          <Route key={index} path={item.path} component={item.component} />
        ))
      }
      {
        props.mainPath ? 
        <Route exact path="/">
          <Redirect to={`${props.mainPath}`} />
        </Route> : null
      }

      </Switch>
      {props.inRoom ? <AppPluginContainer/> : null}
      {props.inRoom ? <ToastContainer/> : null}
    </>
  )
}

export type RoomContainerParams = {
  language: any;
  params: AppStoreInitParams;
  routes: BizPageRouter[];
  mainPath: string;
}

export const RoomContainer = (props: RoomContainerParams) => {

  useStorageSWContext()

  return (
    <I18nProvider language={props.language}>
      <MemoryRouter>
        <RouteContainer routes={props.routes} mainPath={props.mainPath} inRoom={true} />
      </MemoryRouter>
    </I18nProvider>
  )
}

export const AppContainer = (props: AppContainerProps) => {

  return (
    <Provider store={props.store}>
      <HashRouter>
        <RouteContainer routes={props.routes} inRoom={false} />
      </HashRouter>
    </Provider>
  )
}

type GenAppContainerProps = {
  globalId: string
  appConfig: AppStoreConfigParams
  roomConfig?: RoomParameters
  resetRoomInfo: boolean
  basename?: string
}

type GenAppComponentProps = Pick<AppContainerComponentProps, "routes" | "basename">

export const GenAppContainer = ({globalId, resetRoomInfo, ...config}: GenAppContainerProps) => {
  const appStore = new HomeStore({
    config: config.appConfig,
    roomInfoParams: config.roomConfig,
    language: "",
    resetRoomInfo,
    startTime: 0,
    duration: 0,
  })
  //@ts-ignore
  window[globalId] = appStore
  return (props: GenAppComponentProps) => (
    <AppContainer
      {...props}
      store={appStore} 
    />
  )
}