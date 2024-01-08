[page-spy-web]: https://github.com/HuolalaTech/page-spy-web 'WebUI repo'
[page-spy-api]: https://github.com/HuolalaTech/page-spy-api 'Server repo'
[page-spy-sdk]: https://github.com/HuolalaTech/page-spy 'SDK repo'
[install-go]: https://go.dev/doc/install 'Go Download'
[github-release]: https://github.com/HuolalaTech/page-spy-web/releases/tag/v1.2.0 'PageSpy Release'
[npm-package]: https://www.npmjs.com/package/@huolala-tech/page-spy-api 'NPM package'

[English](./CONTRIBUTING.md) | 中文

# PageSpy Contributing Guide

你好！感谢你拿出时间来为 PageSpy 贡献，对此我们感到非常高兴。任何贡献都可以让 PageSpy 越来越好！在正式提交你的贡献之前，请阅读以下指引文档。

PageSpy 主要由三个仓库组成：

- 调试端 WebUI 代码在 [HuolalaTech/page-spy-web][page-spy-web] 仓库维护；
- 服务器端代码在 [HuolalaTech/page-spy-api][page-spy-api] 仓库维护；
- 需要在客户端引入的 SDK 代码在 [HuolalaTech/page-spy][page-spy-sdk] 仓库维护；

提供服务的方式是托管在 GitHub Package 中的 Docker 镜像（推荐）、[NPM package][npm-package] 或者使用 [Release][github-release] 托管的可执行文件。

## Repo Setup

> 请注意：不是每个仓库都需要在本地搭建开发环境，你可以只专注于一个仓库，请点击 [分情景调试](#分情景调试) 查看详情。

### 搭建服务器端

服务端使用的是 Go 语言开发，所以请先在本地配置 Go 语言开发环境，你可以点击 [安装 Go][install-go] 。

Fork [HuolalaTech/page-spy-api][page-spy-api] 仓库并 clone 到本地，然后按照如下步骤执行：

1. 在 `VSCode` 或者你偏好的编辑器中打开 page-spy-api 项目；

2. 在 page-spy-api 目录下执行命令安装依赖：

   ```bash
   $ go mod tidy
   ```

3. 在 `bin` 文件夹中创建 `local.go` 文件并添加以下内容：

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

4. 在 page-spy-api 目录下执行以下命令启动本地服务：

   ```bash
   $ go run bin/local.go
   ```

   终端将会打印以下输出：

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

5. 验证服务端本地环境是否搭建成功：

   ```bash
   $ curl http://localhost:6752/api/v1/room/list
   ```

   不出意外的话，应该会返回类似下方的内容，代表服务器端环境搭建成功：

   ```bash
   {"code":"success","data":[],"success":true,"message":""}
   ```

### 搭建调试端

Fork [HuolalaTech/page-spy-web][page-spy-web] 仓库并 clone 到本地，page-spy-web 推荐使用 `yarn` 作为包管理器，包管理器用于安装项目依赖。按照如下步骤执行：

1. 在 `VSCode` 或者你偏好的编辑器中打开 page-spy-web 项目；

2. 在 page-spy-web 目录下执行以下命令安装依赖：

   ```bash
   $ yarn install
   ```

3. 在 page-spy-web 目录下新建 `.env.local` 环境变量文件，更新内容用于指定服务端地址：

   ```shell
   VITE_API_BASE=localhost:6752
   ```

4. 在 page-spy-web 目录下执行以下命令启动本地服务：

   ```bash
   $ yarn start:client
   ```

   终端将会打印以下输出，端口可能会不一样，不过这没什么影响：

   ```bash
    VITE v4.3.9  ready in 1386 ms

     ➜  Local:   http://localhost:5173/
     ➜  Network: use --host to expose
     ➜  press h to show help
   ```

5. 在浏览器中访问 http://localhost:5173/ ，如果是首次打开请稍微等一会儿，之后你应该能看到调试端在浏览器上显示。

### 搭建 SDK

Fork [HuolalaTech/page-spy][page-spy-sdk] 仓库并 clone 到本地，page-spy 推荐使用 `yarn` 作为包管理器。按照如下步骤执行：

1. 在 `VSCode` 或者你偏好的编辑器中打开 page-spy 项目；

2. 在 page-spy 目录下执行以下命令安装依赖：

   ```bash
   $ yarn install
   ```

3. 以下命令可以直接使用：

   - `yarn build`：执行构建生成 SDK。产物将生成放在项目目录下的 dist 文件夹；
   - `yarn build:watch`：监听模式下的构建。当发现内容更新将自动构建；
   - `yarn test`：执行单元测试；

## 分情景调试

在本地同时搭建三个仓库的开发环境并不是必须的，比如说：如果你只想专注于贡献 [HuolalaTech/page-spy][page-spy-sdk] ，你完全可以这么做！本章接下来将通过不同的情景来介绍如何快速的开始贡献。

### 准备工作

PageSpy 对外提供的使用方式有下面几种，它们打包了上面三个仓库的实现细节，支持一键使用。选择任意你偏好的方式在本地或者线上部署：

1. 使用 Docker 镜像的方式启动服务:

   ```bash
   $ docker run -d --restart=always -p 6752:6752 --name="pageSpy" ghcr.io/huolalatech/page-spy-web:release
   ```

2. 使用 NPM package 的方式启动服务：

   ```bash
   $ yarn global add pm2 @huolala-tech/page-spy-api
   $ pm2 start page-spy-api
   ```

3. 使用在 [Release][github-release] 页面托管的二进制可执行文件；

当你操作完成后，下文假设您的服务部署在 https://example.com ，现在调试端、服务端、SDK 都已经准备就绪。

创建测试项目。创建一个测试项目或者直接使用你已有的项目，测试项目用于引入 SDK 并连接我们的服务。

<img src="./src/assets/image/relation.png" alt="Relation" width="90%" />

### 专注调试端

如果你想只专注于为调试端贡献，按照 [搭建调试端](#搭建调试端) 的步骤在本地搭建服务，其中第三步需要更新为:

```bash
# .env.local
VITE_API_BASE=example.com
```

> 请注意：这里的 "example.com" 只是假设你将服务部署在 https://example.com ，你应该替换为实际部署地址。

等待服务启动后，在浏览器打开调试端地址 http://localhost:5173 ，端口可能不一样，请按照你本地服务打印的地址访问。点击顶部「接入 SDK」菜单，按照指引在测试项目中接入，其中实例化需要传入配置：

```ts
new PageSpy({
  api: 'example.com',
  clientOrigin: 'http://localhost:5173',
  project: '<任意名称>',
  ......
});
```

之后启动测试项目，测试项目的页面左下角应该出现了 PageSpy 的标志（白色圆形容器，中间包含了 PageSpy logo）。通过 https://localhost:5173 访问调试端顶部菜单「房间列表」，测试项目的调试房间应该出现在列表上了。现在你可以修改调试端代码，开始为调试端仓库贡献。

### 专注 SDK

如果你想只专注于为 SDK 提交贡献，按照 [搭建 SDK](#搭建-sdk) 的步骤在本地搭建服务。

建议执行终端命令，当发生变更时即可执行构建：

```bash
$ yarn build:watch
```

这将执行构建并在 `/dist` 目录下生成 SDK 产物。在测试项目中引入构建后的 SDK 产物，实例化 PgaeSpy 需要传入配置：

```ts
new PageSpy({
  api: 'example.com',
  clientOrigin: 'http://example.com',
  project: '<任意名称>',
  ......
});
```

之后启动测试项目，测试项目的页面左下角应该出现了 PageSpy 的标志（白色圆形容器，中间包含了 PageSpy logo）。通过 https://example.com 访问调试端顶部菜单「房间列表」，测试项目的调试房间应该出现在列表上了。现在你可以修改 SDK 代码，开始为 SDK 仓库贡献。
