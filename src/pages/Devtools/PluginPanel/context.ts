import type { SocketStore } from '@/store/socket-message/socket';
import { CUSTOM_EVENT } from '@/store/socket-message/socket';
import type { PluginPanelContribution } from '@/store/socket-message/plugin-interface';

/** What the host hands to a plugin panel's `mount()`. */
export interface PluginHostContext {
  room: { address: string; secret?: string };
  panel: PluginPanelContribution;
  unicast: (message: { type: string; data: unknown }) => void;
  subscribe: (type: string, handler: (data: unknown) => void) => () => void;
  onConnectionChange: (handler: () => void) => () => void;
  isClientConnected: () => boolean;
}

/**
 * The services a plugin panel is given.
 *
 * Deliberately narrow and framework-free: no store, no React, no host internals. That
 * is what lets a panel be written in anything — the Vue Devtools panel that ships with
 * this feature uses no framework at all — and what keeps the host free to refactor
 * without breaking plugins.
 */
export function createPluginHostContext(
  socket: SocketStore,
  panel: PluginPanelContribution,
  room: { address: string; secret?: string },
): PluginHostContext {
  return {
    room,
    panel,

    unicast(message) {
      socket.unicastMessage(message);
    },

    subscribe(type, handler) {
      // Not `SocketStore.addListener`: its `listenerStore` holds one callback per type,
      // so a second subscriber evicts the first, and a teardown removes whichever
      // callback is current rather than its own.
      const wrapped = (evt: Event) => handler((evt as CustomEvent).detail);
      socket.addEventListener(type, wrapped);
      return () => socket.removeEventListener(type, wrapped);
    },

    onConnectionChange(handler) {
      window.addEventListener(CUSTOM_EVENT.ConnectStatus, handler);
      return () =>
        window.removeEventListener(CUSTOM_EVENT.ConnectStatus, handler);
    },

    isClientConnected() {
      return !!socket.clientConnection;
    },
  };
}
