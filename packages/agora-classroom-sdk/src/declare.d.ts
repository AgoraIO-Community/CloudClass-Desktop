import 'twin.macro';
import styledImport, { CSSProp, css as cssImport } from 'styled-components';

declare const CLASSROOM_SDK_VERSION: string;
declare const BUILD_TIME: string;
declare const BUILD_COMMIT_ID: string;
declare const EDU_CATEGORY: string;
declare module 'tailwind.macro';

declare module 'twin.macro' {
  // The styled and css imports
  const styled: typeof styledImport;
  const css: typeof cssImport;
}

declare module 'react' {
  // The css prop
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    css?: CSSProp;
    tw?: string;
  }
  // The inline svg css prop
  interface SVGProps<T> extends SVGProps<SVGSVGElement> {
    css?: CSSProp;
    tw?: string;
  }
}

// The 'as' prop on styled components
declare global {
  namespace JSX {
    interface IntrinsicAttributes<T> extends DOMAttributes<T> {
      as?: string;
    }
  }
}
