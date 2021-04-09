import React, { useEffect, useRef } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { BehaviorSubject } from "rxjs"
import { makeContainer } from "../../../agora-scenario-ui-kit/lib"

const {
  useContext,
  Context,
  Provider,
} = makeContainer('RouterGuard')

export const RouterGuardProvider = ({children}: any) => {

  const stream$ = useRef<BehaviorSubject<any>>(new BehaviorSubject<any>({}))

  useEffect(() => {
    stream$.current.subscribe({
      next: (state: any) => {
        console.log('next state', state)
      }
    })
    return () => {
      const cancel = stream$.current.getValue()
      cancel && cancel()
      stream$.current.complete()
    }
  }, [stream$])

  return (
    <Provider value={{stream$}}>
      {children}
    </Provider>
  )
}

export interface RouterGuardContextProps {
  stream$: BehaviorSubject<any>;
}

export const useRouterGuardContext = () => useContext<RouterGuardContextProps>()

export const useRouterGuard = (path: string, callback: () => Promise<any>) => {

  const history = useHistory()

  const location = useLocation()

  const {stream$} = useRouterGuardContext()

  useEffect(() => {
    if (location.pathname.startsWith('/classroom')) {
      const unblock = history.block((nextLocation, action) => {
        callback()
      })
      stream$.next(unblock)
    }
  }, [stream$, location.pathname, callback, history])
}