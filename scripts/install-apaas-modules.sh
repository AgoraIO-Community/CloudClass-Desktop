#git submodule add ssh://git@git.agoralab.co/aduc/agora-scene-sdk.git packages/agora-rte-sdk
#git submodule add ssh://git@git.agoralab.co/aduc/agora-edu-core-desktop.git packages/agora-edu-core
git submodule update --init --recursive

yarn install

lerna exec --scope=agora-rte-sdk 'yarn build && yarn build:types'
lerna exec --scope=agora-edu-core 'yarn proto && yarn build && yarn build:types'

yarn bootstrap