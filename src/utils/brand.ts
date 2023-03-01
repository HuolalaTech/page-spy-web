// os
import PCSvg from '@/assets/image/pc.svg';
import IOSSvg from '@/assets/image/apple.svg';
import AndroidSvg from '@/assets/image/android.svg';
// browser
import GoogleSvg from '@/assets/image/google.svg';
import SafariSvg from '@/assets/image/safari.svg';
import FirefoxSvg from '@/assets/image/firefox.svg';
import WechatSvg from '@/assets/image/wechat.svg';
import BrowserSvg from '@/assets/image/browser.svg';

export const LOGO = {
  // os
  IOS: IOSSvg,
  Android: AndroidSvg,
  // browser
  Chrome: GoogleSvg,
  Firefox: FirefoxSvg,
  Safari: SafariSvg,
  Weixin: WechatSvg,
};

export type LogoBrand = keyof typeof LOGO;

export function resolveClientInfo(data: string) {
  const [os, browser] = data.split('-');
  const [name, ver = 'Unknown'] = browser.split(':');
  return {
    osName: os,
    osLogo: LOGO[os as LogoBrand] || PCSvg,
    browserLogo: LOGO[name as LogoBrand] || BrowserSvg,
    browserName: name,
    browserVersion: ver,
  };
}
