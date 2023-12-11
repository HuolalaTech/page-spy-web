[page-spy]: https://github.com/HuolalaTech/page-spy.git 'page-spy'

English | [中文](./README.md)

<p align="center">
  <img src="./logo.svg" height="120" />
</p>

<h1 align="center">Page Spy</h1>

**PageSpy** is a remote debugging tool for web project.

Based on encapsulation of native web APIs, it filters and transforms the parameters of native methods when called, and converts into messages with specific format for consumption by the debugger client. The debugger presents ui in an interactive devtools-like for easy viewing after receives the message data.

## When should I use?

<u>It's **PageSpy** show time whenever you can't debug code with local devtools!</u> Let's see the following instances:

**Save communication time, improve collaboration efficiency**: Telecommuting and cross-regional collaboration becoming more and more common,effective collaboration between programmers and testers become extremely important. However, traditional communication such as email, telephone, and video conferencing suffer from inefficient communication, incomplete issue information, and misunderstanding or misjudgment, etc. PageSpy provides project runtime info for technicians to view at the debugger client, and testers no longer need to provide issue information to technicians frequently by text, screenshot, and recording screen.

**Accurately troubleshoot to avoid looking a needle in the ocean**: When an application has a white screen or other similar fatal problems on the user's device, it has always been a difficult problem for technicians to quickly locate the error, accurately troubleshoot and fix it. Traditional methods of locating problems include data monitoring and log analysis, which not only consume a lot of time and energy to analyze and diagnose problems, but also rely heavily on technicians to understand business scenarios and code implementation.PageSpy presents the error message directly to the technician, eliminates other interference, just shows the code!

## How to use?

In order to ensure data security and facilitate your usage, we offer comprehensive, out-of-the-box deployment solutions. Developers can choose any deployment method according to their own situations.

### Option 1: deploy by docker

```bash
$ docker run -d --restart=always -p 6752:6752 --name="pageSpy" ghcr.io/huolalatech/page-spy-web:release
```

Once the deployment is successful, you can open the browser and access `<host>:6752`, the `Inject SDK` menu will be at the top, and you can find how to configure and integrate in the business project by click the menu.

### Option 2: deploy by node

```bash
$ yarn global add @huolala-tech/page-spy-api

# if you use npm

$ npm install -g @huolala-tech/page-spy-api
```

After the download is complete, you can directly execute `page-spy-api` in the command line to start the service.
It will also generate a configuration file called config.json in the running directory, and modifying this file allows you to change the running port.

```json
{
  "port": "6752"
}
```

Once the deployment is successful, you can open the browser and access `<host>:6752`, the `Inject SDK` menu will be at the top, and you can find how to configure and integrate in the business project by click the menu.

## How to contribute?

Click to see the [Contribution](./CONTRIBUTING_EN.md)

## FAQ

Click to see the [FAQ](https://github.com/HuolalaTech/page-spy-web/wiki/faq)
