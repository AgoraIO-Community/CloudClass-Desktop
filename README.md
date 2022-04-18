> _其他语言版本：[简体中文](README.zh.md)_

## CloudClass Desktop

## Install

```bash
# install all dependencies via lerna and npm
yarn bootstrap
```

## Config

```bash
# copy config template to agora-classroom-sdk project
cp .env.example packages/agora-classroom-sdk/.env

# fill the config with your agora.io development environment
```

## How to generate RtmToken using your own AppId and Secret

```bash
# If .env contains `REACT_APP_AGORA_APP_ID` and `REACT_APP_AGORA_APP_CERTIFICATE` configurations, the client will automatically generate an RTM Token for you
REACT_APP_AGORA_APP_ID=
REACT_APP_AGORA_APP_CERTIFICATE=
```

## Run

```bash
yarn dev
```

## Pack the Electron client

```bash
# Build Web Resources
yarn build:demo
# Build a Windows client(Run `yarn build:demo` to build Web resources before pack electron)
yarn pack:electron:win
# Build a Mac client(Run `yarn build:demo` to build Web resources before pack electron)
yarn pack:electron:mac
```
