[page-spy]: https://github.com/HuolalaTech/page-spy.git 'page-spy'
[license-img]: https://img.shields.io/github/license/HuolalaTech/page-spy-web?label=License
[license-url]: https://github.com/HuolalaTech/page-spy-web/blob/main/LICENSE
[release-img]: https://img.shields.io/github/package-json/v/HuolalaTech/page-spy-web/release?label=Release
[release-url]: https://github.com/HuolalaTech/page-spy-web/blob/release/package.json
[download-img]: https://img.shields.io/npm/dw/%40huolala-tech/page-spy-api
[download-url]: https://www.npmjs.com/package/@huolala-tech/page-spy-api
[browser-ver-img]: https://img.shields.io/npm/v/@huolala-tech/page-spy-browser?label=Browser&color=orange
[browser-ver-url]: https://npmjs.com/package/@huolala-tech/page-spy-browser
[uniapp-ver-img]: https://img.shields.io/npm/v/@huolala-tech/page-spy-uniapp?label=UniApp&color=green
[uniapp-ver-url]: https://npmjs.com/package/@huolala-tech/page-spy-uniapp
[wechat-ver-img]: https://img.shields.io/npm/v/@huolala-tech/page-spy-wechat?label=Wechat&color=green
[wechat-ver-url]: https://npmjs.com/package/@huolala-tech/page-spy-wechat
[alipay-ver-img]: https://img.shields.io/npm/v/@huolala-tech/page-spy-alipay?label=Alipay&color=blue
[alipay-ver-url]: https://npmjs.com/package/@huolala-tech/page-spy-alipay
[taro-ver-img]: https://img.shields.io/npm/v/@huolala-tech/page-spy-taro?label=Taro&color=blue
[taro-ver-url]: https://npmjs.com/package/@huolala-tech/page-spy-taro
[harmony-ver-img]: https://harmony.blucas.me/badge/version/@huolala/page-spy-harmony?label=Harmony&color=black
[harmony-ver-url]: https://ohpm.openharmony.cn/#/cn/detail/@huolala%2Fpage-spy-harmony
[sdk-build-img]: https://img.shields.io/github/actions/workflow/status/HuolalaTech/page-spy/coveralls.yml?logo=github&label=build
[sdk-build-url]: https://github.com/HuolalaTech/page-spy/actions/workflows/coveralls.yml
[sdk-coveralls-img]: https://img.shields.io/coverallsCoverage/github/HuolalaTech/page-spy?label=coverage&logo=coveralls
[sdk-coveralls-url]: https://coveralls.io/github/HuolalaTech/page-spy?branch=main
[api-ver-img]: https://img.shields.io/github/v/tag/HuolalaTech/page-spy-api?label=API
[api-ver-url]: https://github.com/HuolalaTech/page-spy-api/tags
[api-go-img]: https://img.shields.io/github/go-mod/go-version/HuolalaTech/page-spy-api?label=go
[api-go-url]: https://github.com/HuolalaTech/page-spy-api/blob/master/go.mod
[node-deploy]: https://img.shields.io/badge/Node_Deploy-Install-CB3937
[node-deploy-url]: https://pagespy.org/#/docs/deploy-with-node
[docker-deploy]: https://img.shields.io/badge/Docker_Deploy-Install-1E63ED
[docker-deploy-url]: https://pagespy.org/#/docs/deploy-with-docker
[bt-deploy]: https://img.shields.io/badge/BT_Deploy-Install-20a53a
[bt-deploy-url]: https://pagespy.org/#/docs/deploy-with-baota

<div align="center">
  <img src="./logo.svg" height="100" />

  <h1>Page Spy</h1>

[![Release][release-img]][release-url]
[![license][license-img]][license-url]
[![Build Status][sdk-build-img]][sdk-build-url] <br />
[![Browser SDK version][browser-ver-img]][browser-ver-url]
[![Wechat SDK version][wechat-ver-img]][wechat-ver-url]
[![Alipay SDK version][alipay-ver-img]][alipay-ver-url]
[![UniApp SDK version][uniapp-ver-img]][uniapp-ver-url]
[![Taro SDK version][taro-ver-img]][taro-ver-url]
[![Harmony SDK version][harmony-ver-img]][harmony-ver-url]
[![API Version][api-ver-img]][api-ver-url] <br />
[![Deploy with Node][node-deploy]][node-deploy-url]
[![Deploy with Docker][docker-deploy]][docker-deploy-url]
[![Deploy with Baota][bt-deploy]][bt-deploy-url]

<a href="https://www.producthunt.com/posts/pagespy?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-pagespy" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=429852&theme=light" alt="PageSpy - Remote&#0032;debugging&#0032;as&#0032;seamless&#0032;as&#0032;local&#0032;debugging&#0046; | Product Hunt" height="36" /></a> <a href="https://news.ycombinator.com/item?id=38679798" target="_blank"><img src="https://hackernews-badge.vercel.app/api?id=38679798" alt="PageSpy - Remote&#0032;debugging&#0032;as&#0032;seamless&#0032;as&#0032;local&#0032;debugging&#0046; | Hacker News" height="36" /></a>

[English](./README.md) | [中文](./README_ZH.md) | 日本語

</div>

## Intro

PageSpy は、Web / Miniprogram / 鸿蒙（Harmony）OS APP プロジェクトなどのプラットフォームのデバッグに使用されるツールです。

ネイティブ Web API のカプセル化に基づいて、呼び出されたときにネイティブメソッドのパラメータをフィルタリングして変換し、デバッガークライアントが消費するための特定の形式のメッセージに変換します。デバッガーは、メッセージデータを受信した後、対話型の devtools のような ui を表示し、簡単に見ることができる。

![Home](./.github/assets/dashboard-en.png)

## なぜ PageSpy なのか?

> 百聞は一見にしかず。

![Why is PageSpy](./.github/assets/why-is-pagespy-en.png)

## どのような場合に使うべきですか？

<u>ローカルの devtools でコードをデバッグできないときは、いつでも **PageSpy** の出番です！</u>次の例を見てみましょう:

- H5 や webview アプリのローカルでのデバッグ: 従来、H5 で情報を表示できるパネルを提供する製品もありましたが、モバイル端末の小さな画面では操作が不便で、表示もユーザーフレンドリーではありません。情報が切り捨てられるなどの問題もよくあります。
- リモートワークと地域を越えたコラボレーション: 電子メール、電話、ビデオ会議といった従来のコミュニケーションは非効率的で、障害情報は包括的でないため、誤解や誤った判断を招きやすい。
- ユーザーデバイスのホワイトスクリーンの問題: データモニタリングやログ分析などの従来のトラブルシューティングのアプローチは、トラブルシューターがビジネス要件と技術的実装を理解することに依存しています。

これらの問題に共通するのは、開発者がコンソールを使ったときのように簡単にランタイム情報を見ることができないということです。

これに対処するため、PageSpy は技術担当者がデバッグ側で検査できるように、プロジェクトのライブビューを提供します。リモート共同作業シナリオでは、テスト担当者は、テキスト、スクリーンショット、音声メッセージ、または画面録画を通じて、技術担当者に障害情報を頻繁に提供する必要がなくなりました。

## 使用方法は？

データのセキュリティを確保し、利用を容易にするために、私たちは包括的な、すぐに使えるデプロイソリューションを提供しています。開発者は、それぞれの状況に応じて、どのようなデプロイ方法を選択することもできます。

### オプション 1: node によるデプロイ 👍

> ビデオチュートリアル:
>
> <a href="https://www.youtube.com/watch?v=5zVnFPjursQ" target="_blank"><img src="./.github/assets/video-node-en.jpg" width="320" /></a>

```bash
yarn global add @huolala-tech/page-spy-api@latest

# npm を使用する場合

npm install -g @huolala-tech/page-spy-api@latest
```

ダウンロードが完了したら、コマンドラインで `page-spy-api` を直接実行してサービスを開始することができます。起動完了後、ブラウザで `http://localhost:6752` にアクセスし、ローカルテストが完了したらサーバーにデプロイすることができます。

### オプション 2: docker によるデプロイ

> ビデオチュートリアル:
>
> <a href="https://www.youtube.com/watch?v=AYD84Kht5yA" target="_blank"><img src="./.github/assets/video-docker-en.jpg" width="320" /></a>

```bash
docker run -d --restart=always -v ./log:/app/log -v ./data:/app/data -p 6752:6752 --name="pageSpy" ghcr.io/huolalatech/page-spy-web:latest
```

起動完了後、ブラウザで `http://localhost:6752` にアクセスし、ローカルテストが完了したらサーバーにデプロイすることができます。

## コントリビュートするには？

クリックして [Contributing](./CONTRIBUTING.md) をご覧ください。

## FAQ

クリックして [FAQ](https://www.pagespy.org/#/docs/faq) をご覧ください。

## コミュニティ

[公式 Discord サーバー](https://discord.gg/ERPpNZkX)に参加してください！

## ロードマップ

クリックして [Roadmap](https://github.com/orgs/HuolalaTech/projects/1) をご覧ください。
