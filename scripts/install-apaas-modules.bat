call git submodule update --init --recursive

call yarn install

set bin_path=node_modules\.bin

call %bin_path%\lerna exec --scope=agora-rte-sdk 'call yarn build && call yarn build:types'
call %bin_path%\lerna exec --scope=agora-edu-core 'call yarn proto && call yarn build && call yarn build:types'

call yarn bootstrap