declare const deprecate: (replaceApi?: string) => void;
declare class Config {
    glDebug: boolean;
    constructor();
    setGlDebug(enable: boolean): void;
    getGlDebug(): boolean;
}
declare const config: Config;
export { config, Config, deprecate };
