import React, { useReducer } from 'react'
import { I18nLanguage, translate } from '~utilities'

interface I18n {
  lang: I18nLanguage,
  t: (str: string) => string,
  changeLanguage: (lang: I18nLanguage) => void,
}

export const makeI18nProvider = (lang: I18nLanguage) => {

  const I18nContext = React.createContext({} as I18n)

  return {
    I18nProvider: ({children, }: any) => {
      const [i18nConfig, updateI18nConfig] = React.useState<I18nLanguage>(lang)
      const t = React.useCallback((str: string) => {
        return translate(i18nConfig, str)
      }, [i18nConfig, translate])
      return (
        <I18nContext.Provider value={{lang: i18nConfig, t, changeLanguage: updateI18nConfig}}>
          {children}
        </I18nContext.Provider>
      )
    },
    useI18nContext: () => {
      return React.useContext(I18nContext)
    }
  }
}