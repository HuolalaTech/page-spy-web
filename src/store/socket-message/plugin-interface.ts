/**
 * The debugger-side plugin contract, and the code that reads it off the wire.
 *
 * This deliberately mirrors the `debugger` contribution on the SDK's existing
 * `PageSpyPlugin` — it is an extension of that concept, not a second one. A PageSpy
 * plugin already renders into PageSpy's local floating panel (`onMounted` gets a DOM
 * root, `onActionSheet` registers buttons); this is the same idea aimed at the remote
 * debugger surface.
 *
 * The host knows nothing about any particular plugin. It receives interfaces on the
 * `client-info` payload, unions their message types into the dispatch allow-list, and
 * renders their panels. Everything specific to a plugin — its key, its title, where its
 * bundle and any frame it needs are hosted, and what the panel does — is data.
 */

export interface PluginPanelContribution {
  /** Route + identity, e.g. 'MyPanel' -> the debugger's `#MyPanel` route. */
  key: string;
  /** Sidebar label. Plugins ship their own strings, so this is literal text. */
  title: string;
  /** Optional icon hint. */
  icon?: string;
  /** Lower sorts first. */
  order?: number;
  /** Classic script that registers a `mount()` for this key. */
  bundle: string;
  /** Optional page the panel shows in an iframe (e.g. a DevTools client SPA). */
  frame?: string;
  /** Only offered in browser rooms. */
  browserOnly?: boolean;
}

export interface DebuggerPluginInterface {
  name: string;
  /** Contract version. A interface we cannot understand is ignored, not half-used. */
  proto: string;
  messageTypes?: string[];
  panels?: PluginPanelContribution[];
  locales?: Record<string, Record<string, string>>;
}

/** Version of this contract the host speaks. */
export const SUPPORTED_PLUGIN_PROTO = '8.2.1';

/**
 * Narrows an entry of `clientInfo.plugins`.
 *
 * Entries may be a bare string (the documented, historical shape — page-spy-web's own
 * `MPEvalPlugin` check relies on it) or a interface object.
 */
export function isPluginInterface(
  value: unknown,
): value is DebuggerPluginInterface {
  const candidate = value as DebuggerPluginInterface | null;
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof candidate?.name === 'string' &&
    typeof candidate?.proto === 'string'
  );
}

/**
 * Turns the `client-info` plugin list into panels.
 *
 * Two host-side jobs, both driven purely by data the client publishes:
 *
 *  1. **Message types.** A plugin that tunnels a custom type would otherwise have its
 *     frames dropped by the dispatch allow-list. `registerCustomMessageType` is the
 *     generic seam for that, and the store's client-info listener calls it with
 *     whatever this module extracts.
 *  2. **Panels.** Flatten every interface's panels so the sidebar and router can
 *     treat them exactly like built-ins.
 */

/**
 * Interfaces in a `client-info` plugin list, in publish order.
 *
 * An understood `proto` is the only requirement. A plugin may tunnel message types
 * with no panel at all, and requiring one here would drop the interface before the
 * client-info listener registered its types, silencing the tunnel this exists to open.
 */
export function extractPluginInterfaces(
  plugins: unknown,
): DebuggerPluginInterface[] {
  if (!Array.isArray(plugins)) return [];
  return plugins.filter(
    (value): value is DebuggerPluginInterface =>
      isPluginInterface(value) && value.proto === SUPPORTED_PLUGIN_PROTO,
  );
}

export interface RegisteredPanel {
  panel: PluginPanelContribution;
  /** Owning plugin, for diagnostics and error messages. */
  pluginName: string;
  /** Stable identity: two plugins could otherwise claim the same key. */
  id: string;
}

/**
 * Flattens interfaces into panels, sorted and de-duplicated by key (first wins, so a
 * plugin cannot silently shadow a built-in or another plugin).
 */
export function collectPanels(
  interfaces: DebuggerPluginInterface[],
): RegisteredPanel[] {
  const seen = new Set<string>();
  const panels: RegisteredPanel[] = [];

  for (const pluginInterface of interfaces) {
    for (const panel of pluginInterface.panels ?? []) {
      if (seen.has(panel.key)) continue;
      seen.add(panel.key);
      panels.push({
        panel,
        pluginName: pluginInterface.name,
        id: `${pluginInterface.name}:${panel.key}`,
      });
    }
  }

  return panels.sort((a, b) => (a.panel.order ?? 0) - (b.panel.order ?? 0));
}
