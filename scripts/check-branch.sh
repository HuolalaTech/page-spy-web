#!/bin/bash
# 检查是否在 release 分支
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)

if [ "$CURRENT_BRANCH" != "release" ]; then
  echo "❌ Change the version can only be performed on the 'release' branch."
  exit 1
fi
