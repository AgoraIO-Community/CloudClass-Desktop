import { RoomParameters } from '@/edu-sdk/declare';
import { AppRouteComponent, routesMap } from '@/router';
import { BizPageRouter } from '@/types';
import { AppStore, AppStoreConfigParams, HomeStore } from '@/stores/app';
import { Provider } from 'mobx-react';
import React, { useEffect } from 'react';
import { HashRouter, MemoryRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { registerWorker, useStorageSW } from '@/utils/utils';
import {I18nProvider, language$, useI18nContext} from 'agora-scenario-ui-kit'
export interface RouteContainerProps {
  routes: BizPageRouter[]
  mainPath?: string
}

export interface AppContainerProps extends RouteContainerProps {
  basename?: string
  store: HomeStore
}

export interface RoomContainerProps extends RouteContainerProps {
  basename?: string
  store: AppStore
}

type AppContainerComponentProps = Omit<AppContainerProps, 'defaultStore'>

export const RouteContainer = (props: RouteContainerProps) => {

  useI18nContext()

  const routes = props.routes
    .filter((path: string) => routesMap[path])
    .reduce((acc: AppRouteComponent[], item: string) => {
    acc.push(routesMap[item])
    return acc
  }, [])

  return (
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
  )
}

export const RoomContainer = (props: RoomContainerProps) => {

  useStorageSW()

  //@ts-ignore
  window.language$ = language$

  return (
    <Provider store={props.store}>
      <I18nProvider>
        <Router>
          <RouteContainer routes={props.routes} mainPath={props.mainPath} />
        </Router>
      </I18nProvider>
    </Provider>
  )
}

export const AppContainer = (props: AppContainerProps) => {

  // useStorageSW()

  return (
    <Provider store={props.store}>
      <I18nProvider>
        <HashRouter>
          <RouteContainer routes={props.routes} />
        </HashRouter>
      </I18nProvider>
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
    translateLanguage: "",
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