> _其他语言版本：[简体中文](README.zh.md)_

# This branch is still in development stage, PR is not accepted at this stage.

## CloudClass Desktop

## Install

```bash
# install all dependencies via lerna and npm
yarn bootstrap
```

## Config

```bash
# copy config template to agora-classroom-sdk project
cp .env.example packages/agora-classroom-sdk/.env.dev

# fill the config with your agora.io development environment
```

## How to generate RtmToken using your own AppId and Secret

```bash
# If .env.dev contains `REACT_APP_AGORA_APP_ID` and `REACT_APP_AGORA_APP_CERTIFICATE` configurations, the client will automatically generate an RTM Token for you
REACT_APP_AGORA_APP_ID=
REACT_APP_AGORA_APP_CERTIFICATE=
```

## Run

```bash
yarn dev
```

## Pack the Electron client

```bash
# Build a Windows client
yarn pack:electron:mac
# Build a Mac client
yarn pack:electron:win
```
