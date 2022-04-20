call git submodule update --init --recursive

call yarn install

set bin_path=node_modules\.bin

call %bin_path%\lerna exec --scope=agora-rte-sdk "npm run build && npm run build:types"
call %bin_path%\lerna exec --scope=agora-edu-core "npm run proto && npm run build && npm run build:types"

call yarn bootstrap