#!/bin/bash

root=$(pwd)

# SDK
target_sdk="${root}/public/page-spy"
mkdir -p "$target_sdk"
cp "${root}/node_modules/@huolala-tech/page-spy-browser/dist/iife/index.min.js" "${root}/public/page-spy/index.min.js"

# Official plugins
target_plugin="${root}/public/plugin"
# @huolala-tech/page-spy-plugin-rrweb
mkdir -p "${target_plugin}/rrweb"
cp "${root}/node_modules/@huolala-tech/page-spy-plugin-rrweb/dist/iife/index.min.js" "${root}/public/plugin/rrweb/index.min.js"
# @huolala-tech/page-spy-plugin-data-harbor
mkdir -p "${target_plugin}/data-harbor"
cp "${root}/node_modules/@huolala-tech/page-spy-plugin-data-harbor/dist/iife/index.min.js" "${root}/public/plugin/data-harbor/index.min.js"
# @huolala-tech/page-spy-plugin-ospy
mkdir -p "${target_plugin}/ospy"
cp "${root}/node_modules/@huolala-tech/page-spy-plugin-ospy/dist/iife/index.min.js" "${root}/public/plugin/ospy/index.min.js"

# source-map
target_sourcemap="${root}/public/source-map"
mkdir -p "$target_sourcemap"
cp "${root}/node_modules/source-map/dist/source-map.js" "${root}/public/source-map/source-map.min.js"
cp "${root}/node_modules/source-map/lib/mappings.wasm" "${root}/public/source-map/mappings.wasm"

# shiki
cp -R "${root}/node_modules/shiki" "${root}/public/shiki"
