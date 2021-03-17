import React, { useEffect } from 'react';
import { Toast, ToastMessage } from '@/components/toast';
import { routesMap, AppRouteComponent } from '@/pages';
import { AppStore, AppStoreConfigParams, HomeStore } from '@/stores/app';
import { observer, Provider } from 'mobx-react';
import { Route, HashRouter, Switch, Redirect, MemoryRouter as Router } from 'react-router-dom';
import ThemeContainer from '../containers/theme-container';
import { RoomParameters } from '@/edu-sdk/declare';
import { BizLogger } from '@/utils/biz-logger';
import { useHomeUIStore } from '@/hooks';
export interface RouteContainerProps {
  routes: string[]
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
    </>
  )
}

export const RoomContainer = (props: RoomContainerProps) => {

  useEffect(() => {
    if (navigator.serviceWorker && navigator.serviceWorker.register) {
      navigator.serviceWorker.register('./worker.js').then(function(registration) {
        console.log("registration finish")
      }).catch(function(error) {
        console.log('An error happened during installing the service worker:');
        console.log(error.message)
      })
    }
  }, [])

  return (
    <Provider store={props.store}>
      <Router>
        <Toast />
        <RouteContainer routes={props.routes} mainPath={props.mainPath} />
      </Router>
    </Provider>
  )
}

export const AppContainer = (props: AppContainerProps) => {

  useEffect(() => {
    if (navigator.serviceWorker && navigator.serviceWorker.register) {
      navigator.serviceWorker.register('./worker.js').then(function(registration) {
        console.log("registration finish")
      }).catch(function(error) {
        console.log('An error happened during installing the service worker:');
        console.log(error.message)
      })
    }
  }, [])

  return (
    <Provider store={props.store}>
      <HashRouter>
        <RouteContainer routes={props.routes} />
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
    translateLanguage: "",
    startTime: 0,
    duration: 0,
  })
  // if (forwardWire) {
  //   forwardWire.delegate = appStore
  // }
  //@ts-ignore
  window[globalId] = appStore
  return (props: GenAppComponentProps) => (
    <AppContainer
      {...props}
      store={appStore} 
    />
  )
}