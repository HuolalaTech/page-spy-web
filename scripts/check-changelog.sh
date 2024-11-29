#!/bin/bash

PACKAGE_VERSION=$(jq -r '.version' package.json)

CHANGELOG_FILES=(
  "src/pages/Docs/md/changelog.zh.mdx"
  "src/pages/Docs/md/changelog.en.mdx"
)

for FILE in "${CHANGELOG_FILES[@]}"; do
  if ! grep -q "$PACKAGE_VERSION" "$FILE"; then
    echo "❌ Cannot find the description about $PACKAGE_VERSION in the $FILE"
    echo "Rollback the version..."

    git reset --hard HEAD^
    git tag -d "v$PACKAGE_VERSION"
    PREV_VERSION=$(git describe --tags --abbrev=0)

    echo "Version rollback to $PREV_VERSION"
    exit 1
  fi
done