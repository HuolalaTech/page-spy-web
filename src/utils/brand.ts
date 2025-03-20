// os
import windowsSvg from '@/assets/image/windows.svg';
import iOSSvg from '@/assets/image/apple.svg';
import androidSvg from '@/assets/image/android.svg';
import harmonySvg from '@/assets/image/harmony.svg';
import linuxSvg from '@/assets/image/linux.svg';
import pcSvg from '@/assets/image/pc.svg';
// browser
import wechatSvg from '@/assets/image/wechat.svg';
import qqSvg from '@/assets/image/qq.svg';
import ucSvg from '@/assets/image/uc.svg';
import baiduSvg from '@/assets/image/baidu.svg';
import edgeSvg from '@/assets/image/edge.svg';
import chromeSvg from '@/assets/image/chrome.svg';
import firefoxSvg from '@/assets/image/firefox.svg';
import safariSvg from '@/assets/image/safari.svg';
import browserSvg from '@/assets/image/browser.svg';
import mpWechatSvg from '@/assets/image/miniprogram.svg';
import mpQQSvg from '@/assets/image/mp-qq.svg';
import mpDouyinSvg from '@/assets/image/mp-douyin.svg';
import mpJDSvg from '@/assets/image/mp-jd.svg';
import mpKuaishouSvg from '@/assets/image/mp-kuaishou.svg';
import mpBaiduSvg from '@/assets/image/mp-baidu.svg';
import mpFeishuSvg from '@/assets/image/mp-feishu.svg';
import mpDingtalkSvg from '@/assets/image/mp-dingtalk.svg';
import mpAlipaySvg from '@/assets/image/mp-alipay.svg';
import mpXhsSvg from '@/assets/image/mp-xhs.svg';
import reactSvg from '@/assets/image/react.svg';
import huaweiSvg from '@/assets/image/huawei-browser.svg';

import uniSvg from '@/assets/image/uni.svg';
import { SpyClient } from '@huolala-tech/page-spy-types';
import { t } from 'i18next';

interface OSInfo {
  type: SpyClient.OS;
  name: string;
  version: string;
  logo?: string;
}

interface BrowserInfo {
  type: SpyClient.Browser;
  name: string;
  version: string;
  logo?: string;
}
export interface ParsedClientInfo {
  ua: string;
  os: OSInfo;
  browser: BrowserInfo;
  framework?: SpyClient.Framework;
  sdk: SpyClient.SDKType;
  isDevTools?: boolean;
  plugins: string[];
}

export type ClientRoomInfo = I.SpyRoom & {
  os: OSInfo;
  browser: BrowserInfo;
};

// Make miniprogram browser types
export const AllMPTypes: SpyClient.MPType[] = [
  'mp-wechat',
  'mp-alipay',
  'mp-qq',
  'mp-baidu',
  'mp-toutiao',
  'mp-douyin',
  'mp-lark',
  'mp-kuaishou',
  'mp-jd',
  'mp-toutiao-lt',
  'mp-douyin-lt',
  'mp-douyin-huoshan',
  'mp-xigua',
  'mp-ppx',
  'mp-dingtalk',
  'mp-xhs',
  'mp-uni', // uniapp 自研小程序引擎
];

export const AllBrowserTypes: SpyClient.Browser[] = [
  'chrome',
  'edge',
  'firefox',
  'safari',
  'baidu',
  'uc',
  'wechat',
  'qq',
  'uni-native',
  'huawei',
  'unknown',
];

export const OS_CONFIG: Record<
  SpyClient.OS,
  {
    logo: string;
    label: string;
  }
> = {
  ios: { logo: iOSSvg, label: 'iOS' },
  ipad: { logo: iOSSvg, label: 'iPad' },
  mac: { logo: iOSSvg, label: 'macOS' },
  windows: { logo: windowsSvg, label: 'Windows' },
  linux: { logo: linuxSvg, label: 'Linux' },
  android: { logo: androidSvg, label: 'Android' },
  harmony: { logo: harmonySvg, label: 'HarmonyOS' },
  unknown: { logo: pcSvg, label: 'Unknown' },
};

export const BROWSER_CONFIG: Record<
  SpyClient.Browser,
  {
    logo: string;
    label: string;
  }
> = {
  chrome: { logo: chromeSvg, label: 'Chrome' },
  firefox: { logo: firefoxSvg, label: 'Firefox' },
  safari: { logo: safariSvg, label: 'Safari' },
  edge: { logo: edgeSvg, label: 'Edge' },
  wechat: { logo: wechatSvg, label: 'WeChat' },
  qq: { logo: qqSvg, label: 'QQ' },
  uc: { logo: ucSvg, label: 'UC' },
  baidu: { logo: baiduSvg, label: 'Baidu' },
  unknown: { logo: pcSvg, label: 'Unknown' },
  'mp-wechat': { logo: mpWechatSvg, label: t('common.mpwechat') },
  'mp-qq': { logo: mpQQSvg, label: t('common.mpqq') },
  'mp-alipay': { logo: mpAlipaySvg, label: t('common.mpalipay') },
  'mp-douyin': { logo: mpDouyinSvg, label: t('common.mpdouyin') },
  'mp-toutiao': { logo: mpDouyinSvg, label: t('common.mptoutiao') },
  'mp-baidu': { logo: mpBaiduSvg, label: t('common.mpbaidu') },
  'mp-lark': { logo: mpFeishuSvg, label: t('common.mpfeishu') },
  'mp-kuaishou': { logo: mpKuaishouSvg, label: t('common.mpkuaishou') },
  'mp-jd': { logo: mpJDSvg, label: t('common.mpjd') },
  'mp-toutiao-lt': { logo: mpDouyinSvg, label: t('common.mptoutiaolt') },
  'mp-douyin-lt': { logo: mpDouyinSvg, label: t('common.mpdouyinlt') },
  'mp-douyin-huoshan': { logo: mpDouyinSvg, label: t('common.mphuoshan') },
  'mp-xigua': { logo: mpDouyinSvg, label: t('common.mpxigua') },
  'mp-ppx': { logo: mpDouyinSvg, label: t('common.mpppx') },
  'mp-dingtalk': { logo: mpDingtalkSvg, label: t('common.mpdingtalk') },
  'mp-xhs': { logo: mpXhsSvg, label: t('common.mpxhs') },
  'mp-uni': { logo: uniSvg, label: 'Uni APP' },
  'uni-native': { logo: uniSvg, label: 'Uni APP' },
  huawei: { logo: huaweiSvg, label: 'Huawei' },
  'react-native': { logo: reactSvg, label: 'React Native' },
  harmony: { logo: harmonySvg, label: 'Harmony APP' },
};

export const getOSName = (os: string) => {
  return OS_CONFIG[os.toLowerCase() as SpyClient.OS]?.label || 'Unknown';
};

export const getOSLogo = (os: string) => {
  return OS_CONFIG[os.toLowerCase() as SpyClient.OS]?.logo || pcSvg;
};

export const getBrowserName = (browser: string) => {
  return (
    BROWSER_CONFIG[browser.toLowerCase() as SpyClient.Browser]?.label ||
    'Unknown'
  );
};

export const getBrowserLogo = (browser: string) => {
  return BROWSER_CONFIG[browser as SpyClient.Browser]?.logo || browserSvg;
};

const MP_REGEXPS = {} as Record<SpyClient.MPType, RegExp>;

AllMPTypes.forEach((mpType) => {
  MP_REGEXPS[mpType] = new RegExp(`${mpType}/([\\d.]+)`);
});

export const BROWSER_REGEXPS = {
  wechat: /MicroMessenger\/([\d.]+)/,
  qq: /(?:QQBrowser|MQQBrowser|QQ)\/([\d.]+)/,
  uc: /(?:UCBrowser|UCBS)\/([\d.]+)/,
  huawei: /(?:HuaweiBrowser)\/([\d.]+)/,
  baidu: /(?:BIDUBrowser|baiduboxapp)[/]?([\d.]*)/,
  edge: /Edg(?:e|A|iOS)?\/([\d.]+)/,
  chrome: /(?:Chrome|CriOS)\/([\d.]+)/,
  firefox: /(?:Firefox|FxiOS)\/([\d.]+)/,
  safari: /Version\/([\d.]+).*Safari/,
  'uni-native': /uni-native\/([\d.]+)/,
  'react-native': /react-native\/([\d.]+)/,
  harmony: /API\/([\d.]+)/,
  ...MP_REGEXPS,
} as Record<SpyClient.Browser, RegExp>;

export const OS_REGEXPS = {
  windows: /(Windows NT |windows\/)([\d_.]+)/,
  ios: /(iPhone OS |ios\/)([\d_.]+)/,
  ipad: /iPad.*OS ([\d_.]+)/,
  mac: /(Mac OS X |macos\/)([\d_.]+)/,
  android: /(Android |android\/)([\d_.]+)/,
  linux: /Linux/,
  harmony: /(OpenHarmony )([\d_.]+)/,
} as Record<SpyClient.OS, RegExp>;

export function parseUserAgent(uaString: string = '') {
  const osInfo: OSInfo = {
    type: 'unknown',
    name: 'Unknown',
    version: 'Unknown',
  };
  const browserInfo: BrowserInfo = {
    type: 'unknown',
    name: 'Unknown',
    version: 'Unknown',
  };

  if (!uaString)
    return {
      os: osInfo,
      browser: browserInfo,
    };

  // 判断操作系统
  for (const key in OS_REGEXPS) {
    if (Object.hasOwn(OS_REGEXPS, key)) {
      const os = key as SpyClient.OS;
      const reg = OS_REGEXPS[os as SpyClient.OS];
      const match = uaString.match(reg);
      if (match) {
        osInfo.type = os;
        osInfo.version = match[match.length - 1]?.replaceAll('_', '.');
        break;
      }
    }
  }

  // 判断浏览器
  for (const key in BROWSER_REGEXPS) {
    if (Object.hasOwn(BROWSER_REGEXPS, key)) {
      const browser = key as SpyClient.Browser;
      const match = uaString.match(BROWSER_REGEXPS[browser]);
      if (match) {
        browserInfo.type = browser;
        // eslint-disable-next-line prefer-destructuring
        browserInfo.version = match[1];
        break;
      }
    }
  }
  osInfo.name = getOSName(osInfo.type);
  osInfo.logo = getOSLogo(osInfo.type);
  browserInfo.name = getBrowserName(browserInfo.type);
  browserInfo.logo = getBrowserLogo(browserInfo.type);

  return {
    os: osInfo,
    browser: browserInfo,
  };
}

// get client info from system message
export function parseClientInfo(msg: SpyClient.DataItem): ParsedClientInfo {
  const { ua = '', sdk = 'unknown', plugins = [], isDevTools } = msg;
  const { os, browser } = parseUserAgent(msg.ua);
  return {
    ua,
    os,
    browser,
    sdk,
    plugins,
    isDevTools,
  };
}

const MOBILE_REGEXPS = [
  OS_REGEXPS.android,
  OS_REGEXPS.ios,
  OS_REGEXPS.ipad,
  OS_REGEXPS.harmony,
];
export function isMobile(ua?: string) {
  if (!ua) return false;
  return MOBILE_REGEXPS.some((reg) => reg.test(ua));
}
