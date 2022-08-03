import { FcrMultiThemes } from '@/infra/types/config';
import { loadTheme } from '@/infra/utils/config-loader';
import {FcrTheme} from "~components";

export class FcrMultiThemesImpl implements FcrMultiThemes {
    get light() {
        return {
            get iconSecondary(): string {
                return '#357bf6';
            },
            get background(): string {
                return '#f9f9fc';
            },
            get safe(): string {
                return '#64bb5c';
            },
            get warning(): string {
                return '#ffb554';
            },
            get foreground(): string {
                return '#ffffff';
            },
            get error(): string {
                return '#f5655c';
            },
            get brand(): string {
                return '#357bf6';
            },
            get iconPrimary(): string {
                return '#357bf6';
            },

        } as FcrTheme;
    }
    get dark() {
        return {
            get iconSecondary(): string {
                return '#357bf6';
            },
            get background(): string {
                return '#262626';
            },
            get safe(): string {
                return '#69c42e';
            },
            get warning(): string {
                return '#ffb554';
            },
            get foreground(): string {
                return '#1d1d1d';
            },
            get error(): string {
                return '#f5655c';
            },
            get brand(): string {
                return '#357bf6';
            },
            get iconPrimary(): string {
                return '#357bf6';
            },

        } as FcrTheme;
    }
}

loadTheme('default', new FcrMultiThemesImpl());
