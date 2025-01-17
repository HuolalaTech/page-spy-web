import { last } from 'lodash-es';

export type InfoItem = {
  keys: string[]; // the key maybe different in different platform
  label: string;
  render?: (props: { value: any }) => JSX.Element;
  icon?: React.ReactNode;
};

export const DeviceInfo: InfoItem[] = [
  {
    keys: ['SDKVersion'],
    label: '客户端基础库版本',
  },
  {
    keys: ['pixelRatio'],
    label: '设备像素比',
  },
  {
    keys: ['screenWidth'],
    label: '屏幕宽度',
  },
  {
    keys: ['screenHeight'],
    label: '屏幕高度',
  },
  {
    keys: ['windowWidth'],
    label: '可使用窗口宽度',
  },
  {
    keys: ['windowHeight'],
    label: '可使用窗口高度',
  },
  {
    keys: ['statusBarHeight'],
    label: '状态栏的高度',
  },
  {
    keys: ['language'],
    label: '当前语言',
  },
  {
    keys: ['platform'],
    label: '客户端平台',
  },
  {
    keys: ['fontSizeSetting'],
    label: '用户字体大小缩放比例',
  },

  {
    keys: ['benchmarkLevel'],
    label: '性能等级',
  },
  //  {
  //   keys: ['safeArea'],
  //   label: '安全区域',
  //   render: ({value}) => {
  //     return <div style={{background: '#eee', borderRadius: 6, padding: '4px 12px'}}>
  //       <p>top: {value.top}</p>
  //       <p>left: {value.left}</p>
  //       <p>right: {value.right}</p>
  //       <p>bottom: {value.bottom}</p>
  //       <p>width: {value.width}</p>
  //       <p>height: {value.height}</p>
  //     </div>
  //   }
  // },

  {
    keys: ['theme'],
    label: '系统当前主题',
  },

  {
    keys: ['enableDebug'],
    label: '是否开启调试',
  },
];

export const SysInfo: InfoItem[] = [
  {
    keys: ['bluetoothEnabled'],
    label: '蓝牙的系统开关',
  },
  {
    keys: ['locationEnabled'],
    label: '地理位置的系统开关',
  },
  {
    keys: ['wifiEnabled'],
    label: 'Wi-Fi 的系统开关',
  },
  {
    keys: ['deviceOrientation'],
    label: '设备方向',
  },
];

export const AppAuthSettings: InfoItem[] = [
  {
    keys: ['albumAuthorized'],
    label: '允许 APP 使用相册的开关（仅 iOS 有效）',
  },
  {
    keys: ['cameraAuthorized'],
    label: '允许 APP 使用摄像头的开关',
  },
  {
    keys: ['locationAuthorized'],
    label: '允许 APP 使用定位的开关',
  },
  {
    keys: ['locationReducedAccuracy'],
    label: '定位准确度。true 表示模糊定位，false 表示精确定位（仅 iOS 有效）',
  },
  {
    keys: ['microphoneAuthorized'],
    label: '允许 APP 使用麦克风的开关',
  },
  {
    keys: ['notificationAuthorized'],
    label: '允许 APP 通知的开关',
  },
  {
    keys: ['notificationAlertAuthorized'],
    label: '允许 APP 通知带有提醒的开关（仅 iOS 有效）',
  },
  {
    keys: ['notificationBadgeAuthorized'],
    label: '允许 APP 通知带有标记的开关（仅 iOS 有效）',
  },
  {
    keys: ['notificationSoundAuthorized'],
    label: '允许 APP 通知带有声音的开关（仅 iOS 有效）',
  },
  {
    keys: ['phoneCalendarAuthorized'],
    label: '允许 APP 使用日历的开关',
  },
];

export const AuthInfo: InfoItem[] = [
  {
    keys: ['scope.hostId'],
    label: '授权抖音号',
  },
  {
    keys: ['scope.userLocation', 'userLocation'],
    label: '精确地理位置',
  },
  {
    keys: ['scope.userFuzzyLocation', 'userFuzzyLocation'],
    label: '模糊地理位置',
  },
  {
    keys: ['scope.userLocationBackground', 'userLocationBackground'],
    label: '后台定位',
  },
  {
    keys: ['scope.record', 'record'],
    label: '麦克风',
  },
  {
    keys: ['scope.camera', 'camera'],
    label: '摄像头',
  },
  {
    keys: ['scope.bluetooth', 'bluetooth'],
    label: '蓝牙',
  },
  {
    keys: ['scope.writePhotosAlbum', 'writePhotosAlbum'],
    label: '添加到相册',
  },
  {
    keys: ['scope.album'],
    label: '读取相册', // 抖音
  },
  {
    keys: ['scope.addPhoneContact', 'addPhoneContact'],
    label: '添加到联系人',
  },
  {
    keys: ['scope.addPhoneCalendar', 'addPhoneCalendar', 'scope.calendar'],
    label: '添加日历事件',
  },
  {
    keys: ['scope.werun', 'werun'],
    label: '微信运动步数',
  },
  {
    keys: ['scope.address', 'address'],
    label: '通讯地址',
  },
  {
    keys: ['scope.invoiceTitle', 'invoiceTitle'],
    label: '发票抬头',
  },
  {
    keys: ['scope.invoice', 'invoice'],
    label: '获取发票',
  },
  {
    keys: ['scope.userInfo', 'userInfo'],
    label: '用户信息',
  },
  {
    keys: ['scope.clipboard'],
    label: '剪切板',
  },
];
