#!/bin/bash

read -p "确认 O-Spy 国内链接已更新? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 请先更新依赖版本"
  exit 1
fi

PACKAGE_VERSION=$(jq -r '.version' package.json)

CHANGELOG_FILES=(
  "src/pages/MainDocs/md/changelog.zh.mdx"
  "src/pages/MainDocs/md/changelog.en.mdx"
  "src/pages/MainDocs/md/changelog.ja.mdx"
  "src/pages/MainDocs/md/changelog.ko.mdx"
)

for FILE in "${CHANGELOG_FILES[@]}"; do
  if ! grep -q "$PACKAGE_VERSION" "$FILE"; then
    echo "❌ Cannot find the $PACKAGE_VERSION description in the changelog"
    echo "⬅️ Rollback the version..."

    git reset --hard HEAD^
    git tag -d "v$PACKAGE_VERSION"
    PREV_VERSION=$(git describe --tags --abbrev=0)

    echo "🟡 Version rollback to $PREV_VERSION"
    exit 1
  fi
done