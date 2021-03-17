import React from 'react'
import { I18nLanguage, makeContainer, translate } from '~utilities'

type I18nContextType = {
  t: (str: string) => string,
  lang: I18nLanguage,
  changeLanguage: (lang: I18nLanguage) => void,
}

export const makeI18nProvider = (lang: I18nLanguage) => {
  const {
    Provider,
    useContext: useI18nContext
  } = makeContainer('I18n')

  return {
    I18nProvider: ({children}: any) => {
      const [i18nConfig, updateI18nConfig] = React.useState<I18nLanguage>(lang)
      const t = React.useCallback((text: string) => {
        return translate(i18nConfig, text)
      }, [i18nConfig])
      return (
        <Provider value={{t, lang: i18nConfig, changeLanguage: (text: I18nLanguage) => updateI18nConfig(text)}}>
          {children}
        </Provider>
      )
    },
    useI18nContext: () => useI18nContext<I18nContextType>()
  }
}
