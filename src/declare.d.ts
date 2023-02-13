import 'twin.macro';
import styledImport, { css as cssImport } from 'styled-components';

declare module 'twin.macro' {
  // The styled and css imports
  const styled: typeof styledImport;
  const css: typeof cssImport;
}

declare module '@classroom/infra/stores/common/base' {
  declare interface LoggerAttached {
    get logger(): Injectable.Logger;
  }
}
