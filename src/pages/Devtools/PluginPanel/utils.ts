import type { PluginHostContext } from './context';

/** The global the panel bundles register themselves on. */
export const PANEL_BUNDLE_GLOBAL = '__PAGESPY_DEBUGGER_PLUGIN_BUNDLES__';

/** A panel bundle's registration. Returns a teardown function. */
export interface PanelBundle {
  version?: string;
  mount: (container: HTMLElement, ctx: PluginHostContext) => () => void;
}

/** Reads a mounted bundle's registration from the global the script wrote. */
export function getPanelBundle(key: string): PanelBundle | undefined {
  const registry = (
    globalThis as unknown as Record<
      string,
      Record<string, PanelBundle> | undefined
    >
  )[PANEL_BUNDLE_GLOBAL];
  return registry?.[key];
}

/**
 * Loads a plugin's panel bundle from a URL the *client* supplied.
 *
 * A classic `<script>` rather than `import()` on purpose: the bundle may be served
 * from the debuggee's origin (which is how a plugin can be entirely self-hosting with
 * no page-spy-web deployment step), and a cross-origin classic script needs no CORS
 * headers whereas a module import does.
 *
 * Loads are de-duplicated per URL, and the returning promise is shared, so opening the
 * same panel twice does not fetch it twice.
 */
const inFlight = new Map<string, Promise<void>>();

export function loadPanelBundle(url: string): Promise<void> {
  const existing = inFlight.get(url);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.dataset.pagespyPluginBundle = url;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () =>
      reject(new Error(`Failed to load plugin bundle: ${url}`)),
    );
    document.head.appendChild(script);
  });

  inFlight.set(url, promise);
  // A failed load should not be cached as "loaded", so a retry can work.
  promise.catch(() => {
    inFlight.delete(url);
    document
      .querySelectorAll<HTMLScriptElement>(
        `script[data-pagespy-plugin-bundle="${CSS.escape(url)}"]`,
      )
      .forEach((el) => el.remove());
  });

  return promise;
}

/**
 * Loads the bundle for a panel and returns its registration.
 *
 * Throws with an actionable message when a bundle loads but registers nothing — which
 * is what a version mismatch between the client's interface and the hosted assets
 * looks like from here.
 */
export async function resolvePanelBundle(panel: {
  key: string;
  bundle: string;
}): Promise<PanelBundle> {
  const already = getPanelBundle(panel.key);
  if (already) return already;

  await loadPanelBundle(panel.bundle);

  const bundle = getPanelBundle(panel.key);
  if (!bundle) {
    throw new Error(
      `The bundle at ${panel.bundle} registered no panel for "#${panel.key}". ` +
        `The plugin's interface and its hosted assets are probably different versions.`,
    );
  }
  return bundle;
}
