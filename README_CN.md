[page-spy]: https://github.com/HuolalaTech/page-spy.git 'page-spy 仓库'

[English](./README.md) | 中文

# PageSpyWeb

> 一站式远程调试工具。

## 简介

这个仓库和 [Huolala-Tech/page-spy](page-spy) 相互配合，具体而言 `page-spy` 负责收集页面信息；`page-spy-web` 消费收集的信息，对数据进行过滤和整理，并将其转换成一种标准格式，最后在页面上呈现。

## 功能概览

- Console 面板: 显示 `console.<log | info | warn | error>` 日志信息，可以执行代码；
- Network 面板: 显示 `fetch` | `XMLHttpRequest` | `navigator.sendBeacon` 的网络请求；
- Element 面板: 查看 HTML 节点树；
- Storage 面板: 查看 `localStorage` | `sessionStorage` | `cookie` 缓存数据；
- System 面板: 显示 userAgent 信息，查看 api 兼容性。

除此之外，当数据发生变化的时候会实时的收到通知。

## 开发

1. 克隆仓库:

```bash
git clone https://github.com/HuolalaTech/page-spy-web.git
```

2. 安装依赖:

```bash
yarn install
```

3. 本地开发:

```bash
yarn start
```

4. 生产构建

```bash
yarn build
```
