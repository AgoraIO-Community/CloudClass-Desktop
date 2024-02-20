import { FC, PropsWithChildren } from 'react';
import { ThemeProvider, FcrTheme, FcrUIConfig, UIConfigProvider } from 'agora-common-libs';
import { I18nProvider } from 'agora-common-libs';

export const Providers: FC<
  PropsWithChildren<{ language: string; uiConfig: FcrUIConfig; theme: FcrTheme }>
> = ({ children, language, uiConfig, theme }) => {
  return (
    <I18nProvider language={language}>
      <ThemeProvider value={theme}>
        <UIConfigProvider value={uiConfig}>{children}</UIConfigProvider>
      </ThemeProvider>
    </I18nProvider>
  );
};
