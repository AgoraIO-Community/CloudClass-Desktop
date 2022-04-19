#git submodule add ssh://git@git.agoralab.co/aduc/agora-scene-sdk.git packages/agora-rte-sdk
#git submodule add ssh://git@git.agoralab.co/aduc/agora-edu-core-desktop.git packages/agora-edu-core
git submodule update --init --recursive

yarn install

bin_path=node_modules/.bin

$bin_path/lerna exec --scope=agora-rte-sdk 'yarn build && yarn build:types'
$bin_path/lerna exec --scope=agora-edu-core 'yarn proto && yarn build && yarn build:types'

yarn bootstrap