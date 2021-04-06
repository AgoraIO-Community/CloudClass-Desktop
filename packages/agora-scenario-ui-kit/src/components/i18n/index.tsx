import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { I18nLanguage, makeContainer, translate } from '~utilities';

const {
  Context,
  useContext,
  Provider,
} = makeContainer('i18n')

const defaultLanguage = 'en'

export const changeLanguage$ = new BehaviorSubject<I18nLanguage>(defaultLanguage)

export type I18nContextType = {
  lang: I18nLanguage,
  t: (text: string, options?: any) => any,
  changeLanguage: (lang: I18nLanguage) => void
}

export const I18nContext = Context
export const useI18nContext = () => useContext<I18nContextType>()

export const transI18n = (text: string, options?: any) => translate(changeLanguage$.getValue(), text, options)

export const t: (text: string, options?: any) => any = (text: string, options?: any) => {
  return (
    React.createElement(TranslateMessage, {text, options}, [])
  )
}

export const I18nProvider = ({children, value = defaultLanguage}: {children: React.ReactNode, value?: I18nLanguage}) => {
  const ref = useRef<BehaviorSubject<I18nLanguage>>(new BehaviorSubject<I18nLanguage>(value))

  useEffect(() => {
    ref.current.subscribe({
      next: (value: I18nLanguage) => {
        changeLanguage$.next(value)
        updateLang(value)
      }
    })
    return () => {
      ref.current.complete()
    }
  }, [ref, value])

  const [lang, updateLang] = useState<I18nLanguage>(ref.current.getValue())
  const trans = useCallback((text: string, options?: any) => {
    return translate(lang, text, options)
  }, [lang])

  const changeLanguage = (lang: I18nLanguage) => {
    ref.current
      .next(lang)
  }

  return (
    <Provider value={{lang, t: trans, changeLanguage}}>
      {children}
    </Provider>
  )
}

export const withI18n = <T,>(WrappedComponent: React.FC<T>) => {
  return (props: T) => (
    <I18nProvider>
      <WrappedComponent {...props} />
    </I18nProvider>
  )
}

export const TranslateMessage: React.FC<any> = ({text, options}: {text: string, options?: any}) => {
  const {t} = useI18nContext()

  return (
    <>
    {t(text, options)}
    </>
  )
}