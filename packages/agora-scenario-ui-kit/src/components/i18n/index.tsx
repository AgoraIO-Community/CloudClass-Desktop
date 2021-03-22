import React, { useCallback, useEffect } from 'react'
import { I18nLanguage, makeContainer, translate } from '~utilities'
import {BehaviorSubject} from 'rxjs'

type I18nContextType = {
  t: (str: string) => string,
  lang: I18nLanguage,
  changeLanguage: (lang: I18nLanguage) => void,
}

export const makeI18nProvider = (defaultLanguage: I18nLanguage) => {
  const {
    Provider,
    useContext: useI18nContext
  } = makeContainer('I18n')

  const language$ = new BehaviorSubject<I18nLanguage>(defaultLanguage)

  return {
    language$,
    I18nProvider: ({children}: any) => {
      const [lang, updateLang] = React.useState<I18nLanguage>(defaultLanguage)

      useEffect(() => {
        language$.subscribe({
          next: (state: I18nLanguage) => {
            updateLang(state) 
          }
        })
        return () => {
          language$.unsubscribe()
        }
      }, [updateLang])
      const t = React.useCallback((text: string) => {
        return translate(lang, text)
      }, [lang])
      return (
        <Provider value={{t, lang: lang, changeLanguage: (text: I18nLanguage) => updateLang(text)}}>
          {children}
        </Provider>
      )
    },
    useI18nContext: () => useI18nContext<I18nContextType>(),
    t: (text: string) => translate(language$.getValue(), text)
  }
}

const defaultLanguage = navigator.language.match(/zh/) ? 'zh' : 'en'

export const {I18nProvider, useI18nContext, language$, t} = makeI18nProvider(defaultLanguage)