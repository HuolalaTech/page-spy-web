import {
  BUNDLED_LANGUAGES,
  BUNDLED_THEMES,
  Highlighter,
  Lang,
  Theme,
} from 'shiki';

class ShikiHighlighter {
  private highlighter: Highlighter | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    this.highlighter = await window.shiki.getHighlighter({
      theme: 'github-dark',
      langs: ['js', 'jsx', 'ts', 'tsx', 'html', 'bash', 'nginx', 'json'],
    });
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public async get(opts?: { lang?: Lang; theme?: Theme }) {
    if (!this.highlighter) {
      await this.init();
    }
    const { lang, theme } = opts || {};
    if (lang && !this.highlighter?.getLoadedLanguages().includes(lang)) {
      const bundles = BUNDLED_LANGUAGES.filter((bundle) => {
        return bundle.id === lang || bundle.aliases?.includes(lang);
      });
      if (bundles.length > 0) {
        await this.highlighter?.loadLanguage(lang);
      }
    }
    if (theme && !this.highlighter?.getLoadedThemes().includes(theme)) {
      if (BUNDLED_THEMES.includes(theme)) {
        await this.highlighter?.loadTheme(theme);
      }
    }
    return this.highlighter!;
  }
}

const sh = new ShikiHighlighter();
export default sh;
