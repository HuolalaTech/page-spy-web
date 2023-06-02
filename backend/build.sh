#!/usr/bin/bash

git_repository="https://github.com/HuolalaTech/page-spy-web"
# git_version=$(git describe --tags --abbrev=0)
git_version="v0.0.1"
npm_version=$(echo "$git_version" | sed 's/^v//')
project_name="page-spy"
organization="huolala-tech"


Generate_main_package_json() {
  echo "@${organization}/${project_name}-${os}-${arch}"
  mkdir -p ./npm/${project_name}

  cat <<EOF > "./npm/${project_name}/package.json"
{
  "name":"@${organization}/${project_name}",
  "version": "$npm_version",
  "description": "The binary runner for ${project_name}.",
  "repository": "${git_repository}",
  "scripts": {
  },
  "engines": {
    "node": ">=17"
  },
  "bin": {
    "${project_name}": "bin/${project_name}"
  },
  "optionalDependencies": {
    "@${organization}/${project_name}-linux-amd64": "${npm_version}",
    "@${organization}/${project_name}-linux-arm": "${npm_version}",
    "@${organization}/${project_name}-linux-arm64": "${npm_version}",
    "@${organization}/${project_name}-linux-mips": "${npm_version}",
    "@${organization}/${project_name}-linux-mips64": "${npm_version}",
    "@${organization}/${project_name}-linux-mips64le": "${npm_version}",
    "@${organization}/${project_name}-linux-mipsle": "${npm_version}",
    "@${organization}/${project_name}-linux-ppc64le": "${npm_version}",
    "@${organization}/${project_name}-linux-ppc64": "${npm_version}",
    "@${organization}/${project_name}-linux-s390x": "${npm_version}",
    "@${organization}/${project_name}-windows-386": "${npm_version}",
    "@${organization}/${project_name}-windows-amd64": "${npm_version}",
    "@${organization}/${project_name}-windows-arm": "${npm_version}",
    "@${organization}/${project_name}-windows-arm64": "${npm_version}",
    "@${organization}/${project_name}-darwin-amd64": "${npm_version}",
    "@${organization}/${project_name}-darwin-arm64": "${npm_version}"
  },
  "license": "MIT"
}
EOF
  cat <<EOF > "./npm/${project_name}/README.md"
  The ${os} ${arch} binary for ${project_name}.
  visit ${git_repository} for detail
EOF

  mkdir -p npm/${project_name}/bin
  cp -r publish/${project_name}.js npm/${project_name}/bin/${project_name}
}

generate_package_json() {
  local os="$1"
  local arch="$2"
  local save_path="$3"

  echo "@${organization}/${project_name}-${os}-${arch}"

  cat <<EOF > "$save_path/package.json"
{
  "name": "@${organization}/${project_name}-${os}-${arch}",
  "version": "$npm_version",
  "description": "The ${os} ${arch} binary for ${project_name}.",
  "repository": "${git_repository}",
  "license": "MIT",
  "preferUnplugged": true,
  "engines": {
    "node": ">=17"
  },
  "os": [
    "${os}"
  ],
  "cpu": [
    "${arch}"
  ]
}
EOF
  cat <<EOF > "$save_path/README.md"
  The ${os} ${arch} binary for ${project_name}.
  visit ${git_repository} for detail
EOF
}

BuildRelease() {
	mkdir -p "build"
	mkdir -p "npm"
	archs=(amd64 arm arm64 mips mips64 mips64le mipsle ppc64le ppc64 s390x)

	for arch in ${archs[@]}
	do
		env GOOS=linux GOARCH=${arch} go build -o ./build/${project_name}-linux-${arch}
    mkdir -p npm/linux-${arch}/bin
    cp -r ./build/${project_name}-linux-${arch} npm/linux-${arch}/bin/${project_name}
    generate_package_json "linux" "${arch}" "npm/linux-${arch}"
	done

	win_archs=(amd64 arm arm64)

	for arch in ${win_archs[@]}
	do
		env GOOS=windows GOARCH=${arch} go build -o ./build/${project_name}-windows-${arch}.exe
    mkdir -p npm/windows-${arch}
    cp -r ./build/${project_name}-windows-${arch}.exe npm/windows-${arch}/${project_name}.exe
    generate_package_json "win32" "${arch}" "npm/windows-${arch}"
	done

	mac_archs=(amd64 arm64)

	for arch in ${mac_archs[@]}
	do
		env GOOS=darwin GOARCH=${arch} go build -o ./build/${project_name}-darwin-${arch}
    mkdir -p npm/darwin-${arch}/bin
    cp -r ./build/${project_name}-darwin-${arch} npm/darwin-${arch}/bin/${project_name}
    generate_package_json "darwin" "${arch}" "npm/darwin-${arch}"
	done
}


MakeRelease() {
  cd build
  mkdir compress
  for i in $(find . -type f -name "${project_name}-linux-*"); do
    cp "$i"  ${project_name}
    tar -czvf compress/"$i".tar.gz  ${project_name}
    rm -f  ${project_name}
  done
  for i in $(find . -type f -name "${project_name}-darwin-*"); do
	echo compress/"$i".tar.gz
    cp "$i"  ${project_name}
    tar -czvf compress/"$i".tar.gz  ${project_name}
    rm -f  ${project_name}
  done
  for i in $(find . -type f -name "${project_name}-windows-*"); do
    cp "$i"  ${project_name}.exe
    zip compress/$(echo $i | sed 's/\.[^.]*$//').zip  ${project_name}.exe
    rm -f  ${project_name}.exe
  done
  cd compress
  find . -type f -print0 | xargs -0 md5sum >md5.txt
  cat md5.txt
  cd ../..
}

# BuildRelease
# MakeRelease
Generate_main_package_json