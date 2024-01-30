[page-spy-web]: https://github.com/HuolalaTech/page-spy-web 'WebUI repo'
[page-spy-api]: https://github.com/HuolalaTech/page-spy-api 'Server repo'
[page-spy-sdk]: https://github.com/HuolalaTech/page-spy 'SDK repo'
[install-go]: https://go.dev/doc/install 'Go Download'
[github-release]: https://github.com/HuolalaTech/page-spy-web/releases/tag/v1.2.0 'PageSpy Release'
[npm-package]: https://www.npmjs.com/package/@huolala-tech/page-spy-api 'NPM package'

English | [中文](./CONTRIBUTING_ZH.md) | [日本語](./CONTRIBUTING_JA.md)

# PageSpy Contributing Guide

Hi! Thank you for investing your time in contributing to PageSpy. We're really excited about that, as any contributions will help to make it better. Before submitting your contribution, please read the following guide.

PageSpy consist of three repositories：

- Debugger WebUI: maintained in [HuolalaTech/page-spy-web][page-spy-web] repository;
- Server: maintained in [HuolalaTech/page-spy-api][page-spy-api] repository;
- SDK which be injected in client: maintained in [HuolalaTech/page-spy][page-spy-sdk] repository;

PageSpy is served as a Docker image hosted on GitHub Package (recommended) / [NPM package][npm-package] or as a binary executable file hosted on the [Release][github-release] page.

## Repo Setup

> HINT: It is not necessary to set up the development environment locally for every repository. You can focus on contributing to just one repository. Click on [Debugging in Different Scenarios](#debugging-in-different-scenarios) for more details.

### Server Setup

The server is developed in the Go language, so please configure the Go language development environment locally first. You can click on [Install Go][install-go] for further information.

To get started, fork the [HuolalaTech/page-spy-api][page-spy-api] repository and clone it to your local machine. Follow the steps below:

1. Open the `page-spy-api` project in `VSCode` or your preferred editor;

2. Run the following command in `page-spy-api` directory to install dependencies：

   ```bash
   $ go mod tidy
   ```

3. Create a `local.go` file in `page-spy-api/bin` directory and update content:

   ```go
   package main

   import (
   	"log"
   	"github.com/HuolalaTech/page-spy-api/config"
   	"github.com/HuolalaTech/page-spy-api/container"
   	"github.com/HuolalaTech/page-spy-api/serve"
   )

   func main() {
   	container := container.Container()
      err := container.Provide(func() *config.StaticConfig {
         return &config.StaticConfig{}
      })

   	if err != nil {
   		log.Fatal(err)
   	}
   	serve.Run()
   }
   ```

4. Run the following command in `page-spy-api` directory to run local server：

   ```bash
   $ go run bin/local.go
   ```

   The terminal will print the following output:

   ```bash
   ➜  page-spy-api git:(master) ✗ go run bin/local.go
   43860
   INFO[0000] local room manager start                      module=LocalRoomManager
   INFO[0000] remote rpc room manager start
   INFO[0000] init join serve local ok

      ____    __
     / __/___/ /  ___
    / _// __/ _ \/ _ \
   /___/\__/_//_/\___/ v4.9.0
   High performance, minimalist Go web framework
   https://echo.labstack.com
   ____________________________________O/_______
                                       O\
   ⇨ http server started on [::]:6752
   ```

5. Verify whether the local environment of the server is successfully built:

   ```bash
   $ curl http://localhost:6752/api/v1/room/list
   ```

   If everything goes well, you should receive a response similar to the following, indicating that the server-side environment has been successfully set up:

   ```bash
   {"code":"success","data":[],"success":true,"message":""}
   ```

### Debugger WebUI Setup

Fork the [HuolalaTech/page-spy-web][page-spy-web] repository and clone it to your local machine. `page-spy-web` recommends using `yarn` as the package manager for installing project dependencies. Follow the steps below:

1. Open the `page-spy-web` project in `VSCode` or your preferred editor;

2. In the `page-spy-web` directory, run the following command to install dependencies:

   ```bash
   $ yarn install
   ```

3. Create a `.env.local` file in the `page-spy-web` directory and update its content to specify the server-side address:

   ```shell
   VITE_API_BASE=localhost:6752
   ```

4. Run the following command in the `page-spy-web` directory to start the local server:：

   ```bash
   $ yarn start:client
   ```

   The terminal will print the following output. The port number may be different, but it doesn't matter:

   ```bash
    VITE v4.3.9  ready in 1386 ms

     ➜  Local:   http://localhost:5173/
     ➜  Network: use --host to expose
     ➜  press h to show help
   ```

5. Visit http://localhost:5173/ in your browser. If it's your first time opening it, please wait for a while. You should then see the debugging end displayed in your browser.

### SDK Setup

Fork the [HuolalaTech/page-spy][page-spy-sdk] repository and clone it to your local machine. `page-spy` recommends using `yarn` as the package manager. Follow the steps below:

1. Open the `page-spy` project in VSCode or your preferred editor;

2. In the `page-spy` directory, run the following command to install dependencies:

   ```bash
   $ yarn install
   ```

3. You can use the following commands directly:：

   - `npx lerna run build`: Performs the build to generate the SDK. The product will be generated and placed in the `dist` folder of the project directory;
   - `npx lerna run build:watch`: Build in watch mode. It will automatically build when the content is updated;
   - `yarn test`: Runs unit tests;

## Debugging in Different Scenarios

It is not necessary to setup the development environment for all three repositories locally, for example: if you only want to focus on contributing to [HuolalaTech/page-spy][page-spy-sdk], you can do so! The following chapter will introduce how to start contributing quickly through different scenarios.

### Preparation

PageSpy provides several ways to use it, which pack the implementation details of the three repositories and support one-click use. Choose any way you prefer to deploy locally or online:

1. Start the service using Docker image:

   ```bash
   $ docker run -d --restart=always -p 6752:6752 --name="pageSpy" ghcr.io/huolalatech/page-spy-web:release
   ```

2. Start the service using NPM package:

   ```bash
   $ yarn global add pm2 @huolala-tech/page-spy-api
   $ pm2 start page-spy-api
   ```

3. Use the binary executable file hosted on the [Release][github-release] page;

After you have completed the above operations, assume that your service is deployed at https://example.com. Now the debugger web, server-side, and SDK are all ready.

Create a test project or use an existing one to import the SDK and connect to our service.

<img src="./src/assets/image/relation.png" alt="Relation" width="90%" />

### Focusing on Debugger WebUI

If you only want to focus on contributing to the debugger, follow the steps in [Debugger WebUI Setup](#debugger-webui-setup) to set up the service locally. For the third step, update it to:

```bash
# .env.local
VITE_API_BASE=example.com
```

> HINT: the "example.com" is just assumed that you have deployed the service at https://example.com, you should replace it with the actual deployment address.

After the service is started, open the debugging end address http://localhost:5173 in the browser. The port may be different, please access it according to the address printed by your local service. Click the "Inject SDK" menu at the top and follow the instructions to access it in the test project. The instantiation requires passing in the configuration:

```ts
new PageSpy({
  api: 'example.com',
  clientOrigin: 'http://localhost:5173',
  project: '<any name>',
  ...
});
```

Then start the test project. The PageSpy logo (white circular container with the PageSpy logo in the middle) should appear in the lower left corner of the test project page. Access the debugging room of the test project through https://localhost:5173, and the test project's debugging room should appear on the list. Now you can modify the debugging end code and contribute to the debugging end repository.

### Focusing on SDK

If you only want to focus on contributing to the SDK, follow the steps in [SDK Setup](#sdk-setup) to set up the service locally.

It is recommended to take the `--scope` params execute the terminal command, which will automatically build when changes occur. For example:

```bash
$ npx lerna run build:watch --scope=@huolala-tech/page-spy-wechat
```

This will build and generate the SDK product in the `packages/*/dist` directory. Import the built SDK product into the test project, and instantiate PageSpy requires passing in the configuration:

```ts
new PageSpy({
  api: 'example.com',
  clientOrigin: 'http://example.com',
  project: '<any name>',
  ...
});
```

Then start the test project. The PageSpy logo (white circular container with the PageSpy logo in the middle) should appear in the lower left corner of the test project page. Access the "Connections" of the test project through https://example.com, and the test project's debugging room should appear on the list. Now you can modify the SDK code and contribute to the SDK repository.
