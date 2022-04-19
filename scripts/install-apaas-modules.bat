call git submodule update --init --recursive

call yarn install

set bin_path=node_modules\\.bin

call %bin_path%\\lerna exec --scope=agora-rte-sdk 'yarn build && yarn build:types'
call %bin_path%\\lerna exec --scope=agora-edu-core 'yarn proto && yarn build && yarn build:types'

call yarn bootstrap