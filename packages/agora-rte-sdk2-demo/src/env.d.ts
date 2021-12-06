interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_REACT_APP_AGORA_APP_ID: string;
  readonly VITE_REACT_APP_AGORA_APP_CERTIFICATE: string;
  readonly VITE_REACT_APP_AGORA_APP_SDK_DOMAIN: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
