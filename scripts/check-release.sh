#!/bin/bash

PACKAGE_VERSION="$(jq -r '.version' package.json)"
rollback_version() {
  local error_msg=$1
  echo "❌ $error_msg"
  git reset --hard HEAD^
  git tag -d "v$PACKAGE_VERSION"
  PREV_VERSION=$(git describe --tags --abbrev=0)
  echo "🟡 Version rollback to $PREV_VERSION"
  exit 1
}

check_ospy_link() {
  read -p "确认 O-Spy 国内链接已更新? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    rollback_version "请先更新 O-Spy 国内链接"
  fi
}

check_changelog() {
  CHANGELOG_FILES=(
    "src/pages/MainDocs/md/changelog.zh.mdx"
    "src/pages/MainDocs/md/changelog.en.mdx"
    "src/pages/MainDocs/md/changelog.ja.mdx"
    "src/pages/MainDocs/md/changelog.ko.mdx"
  )

  for FILE in "${CHANGELOG_FILES[@]}"; do
    if ! grep -q "$PACKAGE_VERSION" "$FILE"; then
      echo "❌ changelog 中没有 $PACKAGE_VERSION 描述"
      rollback_version "请更新 changelog"
    fi
  done
}

check_ospy_link
check_changelog