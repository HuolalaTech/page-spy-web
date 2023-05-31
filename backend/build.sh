#!/usr/bin/bash
BuildRelease() {
	mkdir -p "build"
	archs=(amd64 arm arm64 mips mips64 mips64le mipsle ppc64le ppc64 s390x)

	for arch in ${archs[@]}
	do
		env GOOS=linux GOARCH=${arch} go build -o ./build/page-spy-linux-${arch}
	done

	win_archs=(386 amd64 arm arm64)

	for arch in ${win_archs[@]}
	do
		env GOOS=windows GOARCH=${arch} go build -o ./build/page-spy-windows-${arch}.exe
	done

	mac_archs=(amd64 arm64)

	for arch in ${mac_archs[@]}
	do
		env GOOS=darwin GOARCH=${arch} go build -o ./build/page-spy-darwin-${arch}
	done
}


MakeRelease() {
  cd build
  mkdir compress
  for i in $(find . -type f -name "page-spy-linux-*"); do
    cp "$i"  page-spy
    tar -czvf compress/"$i".tar.gz  page-spy
    rm -f  page-spy
  done
  for i in $(find . -type f -name "page-spy-darwin-*"); do
	echo compress/"$i".tar.gz
    cp "$i"  page-spy
    tar -czvf compress/"$i".tar.gz  page-spy
    rm -f  page-spy
  done
  for i in $(find . -type f -name "page-spy-windows-*"); do
    cp "$i"  page-spy.exe
    zip compress/$(echo $i | sed 's/\.[^.]*$//').zip  page-spy.exe
    rm -f  page-spy.exe
  done
  cd compress
  find . -type f -print0 | xargs -0 md5sum >md5.txt
  cat md5.txt
  cd ../..
}

BuildRelease
MakeRelease
