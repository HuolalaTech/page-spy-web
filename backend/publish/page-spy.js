#!/usr/bin/env node
'use strict';
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, 'default', { value: mod, enumerable: true })
      : target,
    mod,
  )
);

const projectName = 'page-spy';
const organization = 'huolala-tech';
const mainPackage = `@${organization}/${project_name}`;
// lib/npm/node-platform.ts
var fs = require('fs');
var os = require('os');
var path = require('path');
var packageDarwin_arm64 = `@${organization}/${project_name}-darwin-arm64`;
var packageDarwin_x64 = `@${organization}/${project_name}-darwin-amd64`;
var knownWindowsPackages = {
  'win32 arm LE': `"@${organization}/${project_name}-windows-arm"`,
  'win32 arm64 LE': `"@${organization}/${project_name}-windows-arm64"`,
  'win32 x64 LE': `@${organization}/${project_name}-windows-amd64`,
};

var knownUnixLikePackages = {
  'darwin arm64 LE': `@${organization}/${project_name}-darwin-arm64`,
  'darwin x64 LE': `@${organization}/${project_name}-darwin-amd64`,
  'linux arm LE': `@${organization}/${project_name}-linux-arm`,
  'linux arm64 LE': `@${organization}/${project_name}-linux-arm64`,
  'linux x64 LE': `@${organization}/${project_name}-linux-amd64`,
};

function pkgAndSubpathForCurrentPlatform() {
  let pkg;
  let subpath;
  let platformKey = `${process.platform} ${os.arch()} ${os.endianness()}`;
  if (platformKey in knownWindowsPackages) {
    pkg = knownWindowsPackages[platformKey];
    subpath = `${projectName}.exe`;
  } else if (platformKey in knownUnixLikePackages) {
    pkg = knownUnixLikePackages[platformKey];
    subpath = `bin/${projectName}`;
  } else {
    throw new Error(`Unsupported platform: ${platformKey}`);
  }
  return { pkg, subpath };
}

function pkgForSomeOtherPlatform() {
  const libMainJS = require.resolve(mainPackage);
  const nodeModulesDirectory = path.dirname(
    path.dirname(path.dirname(libMainJS)),
  );
  if (path.basename(nodeModulesDirectory) === 'node_modules') {
    for (const unixKey in knownUnixLikePackages) {
      try {
        const pkg = knownUnixLikePackages[unixKey];
        if (fs.existsSync(path.join(nodeModulesDirectory, pkg))) return pkg;
      } catch {}
    }
    for (const windowsKey in knownWindowsPackages) {
      try {
        const pkg = knownWindowsPackages[windowsKey];
        if (fs.existsSync(path.join(nodeModulesDirectory, pkg))) return pkg;
      } catch {}
    }
  }
  return null;
}
function downloadedBinPath(pkg, subpath) {
  const pageSpyLibDir = path.dirname(require.resolve(mainPackage));
  return path.join(
    pageSpyLibDir,
    `downloaded-${pkg.replace('/', '-')}-${path.basename(subpath)}`,
  );
}
function generateBinPath() {
  const { pkg, subpath } = pkgAndSubpathForCurrentPlatform();
  let binPath2;
  try {
    binPath2 = require.resolve(`${pkg}/${subpath}`);
  } catch (e) {
    binPath2 = downloadedBinPath(pkg, subpath);
    if (!fs.existsSync(binPath2)) {
      try {
        require.resolve(pkg);
      } catch {
        const otherPkg = pkgForSomeOtherPlatform();
        if (otherPkg) {
          let suggestions = `
Specifically the "${otherPkg}" package is present but this platform
needs the "${pkg}" package instead. People often get into this
situation by installing page-spy on Windows or macOS and copying "node_modules"
into a Docker image that runs Linux, or by copying "node_modules" between
Windows and WSL environments.

If you are installing with npm, you can try not copying the "node_modules"
directory when you copy the files over, and running "npm ci" or "npm install"
on the destination platform after the copy. Or you could consider using yarn
instead of npm which has built-in support for installing a package on multiple
platforms simultaneously.

If you are installing with yarn, you can try listing both this platform and the
other platform in your ".yarnrc.yml" file using the "supportedArchitectures"
feature: https://yarnpkg.com/configuration/yarnrc/#supportedArchitectures
Keep in mind that this means multiple copies of page-spy will be present.
`;
          if (
            (pkg === packageDarwin_x64 && otherPkg === packageDarwin_arm64) ||
            (pkg === packageDarwin_arm64 && otherPkg === packageDarwin_x64)
          ) {
            suggestions = `
Specifically the "${otherPkg}" package is present but this platform
needs the "${pkg}" package instead. People often get into this
situation by installing page-spy with npm running inside of Rosetta 2 and then
trying to use it with node running outside of Rosetta 2, or vice versa (Rosetta
2 is Apple's on-the-fly x86_64-to-arm64 translation service).

If you are installing with npm, you can try ensuring that both npm and node are
not running under Rosetta 2 and then reinstalling page-spy. This likely involves
changing how you installed npm and/or node. For example, installing node with
the universal installer here should work: https://nodejs.org/en/download/. Or
you could consider using yarn instead of npm which has built-in support for
installing a package on multiple platforms simultaneously.

If you are installing with yarn, you can try listing both "arm64" and "x64"
in your ".yarnrc.yml" file using the "supportedArchitectures" feature:
https://yarnpkg.com/configuration/yarnrc/#supportedArchitectures
Keep in mind that this means multiple copies of page-spy will be present.
`;
          }
          throw new Error(`
You installed page-spy for another platform than the one you're currently using.
This won't work because page-spy is written with native code and needs to
install a platform-specific binary executable.
${suggestions}
`);
        }
        throw new Error(`The package "${pkg}" could not be found, and is needed by page-spy.

If you are installing page-spy with npm, make sure that you don't specify the
"--no-optional" or "--omit=optional" flags. The "optionalDependencies" feature
of "package.json" is used by page-spy to install the correct binary executable
for your current platform.`);
      }
      throw e;
    }
  }
  return { binPath: binPath2 };
}

// lib/npm/node-shim.ts
var { binPath } = generateBinPath();
require('child_process').execFileSync(binPath, process.argv.slice(2), {
  stdio: 'inherit',
});
