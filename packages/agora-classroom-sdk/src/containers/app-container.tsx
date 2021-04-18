import { AppRouteComponent, routesMap } from "@/router"
import { HomeStore } from "@/stores/app/home"
import { BizPageRouter } from "@/types"
import { ToastContainer } from "@/ui-kit/capabilities/containers/toast"
import { AppStoreConfigParams, AppStoreInitParams, I18nProvider, useStorageSWContext } from 'agora-edu-sdk'
import { RoomParameters } from '../api/declare'
import { Provider } from "mobx-react"
import { HashRouter, MemoryRouter, Redirect, Route, Switch } from "react-router-dom"

export interface RouteContainerProps {
  routes: BizPageRouter[];
  mainPath?: string;
  showToast?: boolean;
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
      {props.showToast ? <ToastContainer/> : null}
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
        <RouteContainer routes={props.routes} mainPath={props.mainPath} showToast={true} />
      </MemoryRouter>
    </I18nProvider>
  )
}

export const AppContainer = (props: AppContainerProps) => {

  return (
    <Provider store={props.store}>
      <HashRouter>
        <RouteContainer routes={props.routes} showToast={false} />
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