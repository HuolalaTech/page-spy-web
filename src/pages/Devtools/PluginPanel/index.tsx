import { Alert } from 'antd';
import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useSocketMessageStore } from '@/store/socket-message';
import type { RegisteredPanel } from '@/store/socket-message/plugin-interface';
import useSearch from '@/utils/useSearch';
import { createPluginHostContext } from './context';
import { resolvePanelBundle } from './utils';

/**
 * Hosts one plugin panel.
 *
 * The host does not render the panel: it hands over a plain DOM container and calls
 * `mount(container, ctx)`, taking a teardown function back. That single decision is
 * what keeps this generic — the panel can be written in any framework, or none, and
 * the host needs no knowledge of what it displays.
 *
 * It also means the host never has to share React or its component library with a
 * plugin, which would otherwise pin every plugin to this app's React version.
 */
const PluginPanel = memo(({ registered }: { registered: RegisteredPanel }) => {
  const socket = useSocketMessageStore(useShallow((state) => state.socket));
  const { address = '', secret = '' } = useSearch();
  const { t } = useTranslation('translation', { keyPrefix: 'devtool' });
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  const { panel, pluginName, id } = registered;
  // The client re-sends `client-info` on every debugger JOIN, and each parse builds
  // fresh interface objects, so `registered.panel` is a new reference every time.
  // Depending on it would tear the panel down and remount it on each reconnect.
  const panelRef = useRef(panel);
  panelRef.current = panel;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !socket) return undefined;

    const current = panelRef.current;
    let teardown: (() => void) | undefined;
    let cancelled = false;
    setError(null);

    resolvePanelBundle(current)
      .then((bundle) => {
        // The panel may have been closed while its bundle was in flight.
        if (cancelled) return;
        teardown = bundle.mount(
          container,
          createPluginHostContext(socket, current, { address, secret }),
        );
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : String(cause));
      });

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [id, socket, address, secret]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {error && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 8 }}
          message={t('plugin-load-failed', { title: panel.title })}
          description={
            <>
              <div>{error}</div>
              <div style={{ opacity: 0.7 }}>
                {t('plugin-load-failed-from', { name: pluginName })}
              </div>
            </>
          }
        />
      )}
      {/* The mount point. Owned by the plugin once mounted. */}
      <div
        ref={containerRef}
        data-plugin-panel={panel.key}
        data-plugin-name={pluginName}
        style={{ flex: 1, minHeight: 0 }}
      />
    </div>
  );
});

PluginPanel.displayName = 'PluginPanel';

export default PluginPanel;
