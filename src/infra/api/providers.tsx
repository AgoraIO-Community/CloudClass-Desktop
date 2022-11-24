import { FC } from 'react';
import { I18nProvider, ThemeProvider, FcrTheme, FcrUIConfig, UIConfigProvider } from 'agora-common-libs';

export const Providers: FC<{ language: string; uiConfig: FcrUIConfig; theme: FcrTheme }> = ({
  children,
  language,
  uiConfig,
  theme,
}) => {
  return (
    <I18nProvider language={language}>
      <ThemeProvider value={theme}>
        <UIConfigProvider value={uiConfig}>{children}</UIConfigProvider>
      </ThemeProvider>
    </I18nProvider>
  );
};