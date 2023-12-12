[page-spy]: https://github.com/HuolalaTech/page-spy.git 'page-spy'

[English](./README_EN.md) | 中文

<p align="center">
  <img src="./logo.svg" height="120" />
</p>

<h1 align="center">Page Spy</h1>

## 介绍

**PageSpy** 是一款用来调试远程 Web 项目的工具。

基于对原生 API 的封装，它将调用原生方法时的参数进行过滤、转化，整理成格式规范的消息供调试端消费；调试端收到消息数据，提供类控制台可交互式的功能界面将数据呈现出来。

[![主页](./.github/assets/home.jpg)](https://huolalatech.github.io/page-spy-web)

## 何时使用？

<u>任何无法在本地使用控制台调试的场景，都是 **PageSpy** 可以大显身手的时候！</u>一起来看下面的例子：

- 本地调试 H5、Webview 应用：以往有些产品提供了可以在 H5 上查看信息的面板，但移动端屏幕太小操作不便、显示不友好，以及信息被截断等问题；
- 远程办公、跨地区协同：传统沟通方式如邮件、电话、视频会议等，沟通效率不高、故障信息不全面，容易误解误判；
- 用户终端上出现白屏问题：传统定位问题的方式包括数据监控、日志分析等，这些方式依赖排障人员要理解业务需求场景、技术实现；

此类问题的共同点是开发者无法像使用控制台一样查看运行信息。

对此 PageSpy 提供项目运行现场供技术人员在调试端查看，在远程协同场景中，测试人员不用再频繁的通过文字、截图、语音、录屏等方式向技术人员提供故障信息。

## 如何使用？

为了数据安全和方便您的使用，我们提供完整的、开箱即用的多种部署方案，各位开发者可以根据自己的情况选择任意一种部署方式。

### 第一种：使用 Docker 部署

> 视频教程：[使用 Docker 部署 PageSpy](https://www.bilibili.com/video/BV1Ph4y1y78R)

```bash
$ docker run -d --restart=always -p 6752:6752 --name="pageSpy" ghcr.io/huolalatech/page-spy-web:release
```

启动完成后浏览器访问 `<host>:6752`，页面顶部会出现 `接入 SDK` 菜单，点击菜单查看如何在业务项目中配置并集成。

### 第二种：使用 Node 部署

> 视频教程：[使用 Node 部署 PageSpy](https://www.bilibili.com/video/BV1oM4y1p7Le/?spm_id_from=333.788.recommend_more_video.1&vd_source=6b4fed1a463f67c0e8e56eaa21faa997)

```bash
$ yarn global add @huolala-tech/page-spy-api

# 如果你使用 npm

$ npm install -g @huolala-tech/page-spy-api
```

安装完成之后你可以在命令行中直接执行 `page-spy-api` 启动服务。该命令会在运行目录下面生成配置文件 config.json，修改配置文件可以修改运行端口：

```json
{
  "port": "6752"
}
```

部署完成后浏览器访问 `<host>:6752`，页面顶部会出现 `接入 SDK` 菜单，点击菜单查看如何在业务项目中配置并集成。

## 技术支持

有问题可以使用微信扫码进群。

<div style="display: flex; gap: 12px; flex-wrap: nowrap; overflow: auto">
  <img src="https://public-assets-v.huolala.cn/images/page-spy-wechat-group.jpg" alt="微信群" width="260" />
  <img src="./.github/assets/group-1.jpg" alt="微信群" width="260" />
</div>

## Roadmap

点击查看 [Roadmap](https://github.com/orgs/HuolalaTech/projects/1)。

## 如何贡献代码？

点击查看 [Contributing](./CONTRIBUTING.md)。

## FAQ

点击查看 [常见问题解答](https://github.com/HuolalaTech/page-spy-web/wiki/%F0%9F%90%9E-%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98%E8%A7%A3%E7%AD%94)。
