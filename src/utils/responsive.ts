/**
 * 响应式工具函数
 * 用于检测设备类型和屏幕尺寸
 */

// 移动设备断点
export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 992;
export const DESKTOP_BREAKPOINT = 1200;

/**
 * 检查当前设备是否为移动设备（屏幕宽度小于768px）
 * @returns {boolean} 是否为移动设备
 */
export function isMobileDevice(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * 检查当前设备是否为平板设备（屏幕宽度在768px到992px之间）
 * @returns {boolean} 是否为平板设备
 */
export function isTabletDevice(): boolean {
  return (
    window.innerWidth >= MOBILE_BREAKPOINT && 
    window.innerWidth < TABLET_BREAKPOINT
  );
}

/**
 * 检查当前设备是否为桌面设备（屏幕宽度大于等于992px）
 * @returns {boolean} 是否为桌面设备
 */
export function isDesktopDevice(): boolean {
  return window.innerWidth >= TABLET_BREAKPOINT;
}

/**
 * 添加窗口大小变化监听器
 * @param {Function} callback 窗口大小变化时执行的回调函数
 * @returns {Function} 移除监听器的函数
 */
export function addResizeListener(callback: () => void): () => void {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

/**
 * 使用媒体查询检查是否符合指定的断点
 * @param {string} query 媒体查询字符串
 * @returns {boolean} 是否符合媒体查询
 */
export function matchesMediaQuery(query: string): boolean {
  return window.matchMedia(query).matches;
}

/**
 * 检查是否为触摸设备
 * @returns {boolean} 是否为触摸设备
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    (navigator as any).msMaxTouchPoints > 0
  );
} 