[page-spy]: https://github.com/HuolalaTech/page-spy.git 'page-spy'

English | [中文](./README_CN.md)

<p align="center">
  <img src="./logo.svg" height="120" />
</p>

<h1 align="center">PageSpyWeb</h1>

> All-In-One Remote Debugging Tool.

## What's this

This repo and [Huolala-Tech/page-spy][page-spy] work together, where `page-spy` collects information and `page-spy-web` consumes and filters, organizes, and converts information into a standardized format, which is then showed on the page.

## Feature Overview

- Console panel: show log about `console.<log | info | warn | error>`, and **run code**;
- Network panel: network request info about `fetch` | `XMLHttpRequest` | `navigator.sendBeacon`;
- Element panel: the HTML node tree;
- Storage panel: the cache info about `localStorage` | `sessionStorage` | `cookie`;
- System panel: show the userAgent info and api compatibility overview.

In addition, you will receive real-time notifications whenever data changes.

## Develop

1. Clone the repo:

```bash
git clone https://github.com/HuolalaTech/page-spy-web.git
```

2. Install the deps:

```bash
yarn install
```

3. Local development:

```bash
yarn start
```

4. Build for production

```bash
yarn build
```
