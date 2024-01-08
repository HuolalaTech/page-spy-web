#!/bin/bash

root=$(pwd)

# SDK
target_sdk="${root}/public/page-spy"
mkdir -p "$target_sdk"
cp "${root}/node_modules/@huolala-tech/page-spy/dist/web/index.min.js" "${root}/public/page-spy/index.min.js"

# source-map
target_sourcemap="${root}/public/source-map"
mkdir -p "$target_sourcemap"
cp "${root}/node_modules/source-map/dist/source-map.js" "${root}/public/source-map/source-map.min.js"
cp "${root}/node_modules/source-map/lib/mappings.wasm" "${root}/public/source-map/mappings.wasm"

# shiki
cp -R "${root}/node_modules/shiki" "${root}/public/shiki"
