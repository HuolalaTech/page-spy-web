import {
  BUNDLED_LANGUAGES,
  BUNDLED_THEMES,
  Highlighter,
  Lang,
  Theme,
} from 'shiki';

class ShikiHighlighter {
  private highlighter: Highlighter | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // 不在构造函数中立即初始化
  }

  private async init() {
    if (!window.shiki) {
      throw new Error('Shiki is not loaded yet');
    }
    
    try {
      this.highlighter = await window.shiki.getHighlighter({
        theme: 'github-dark',
        langs: ['js', 'jsx', 'ts', 'tsx', 'html', 'bash', 'nginx', 'json'],
      });
    } catch (error) {
      console.error('Failed to initialize Shiki highlighter:', error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public async get(opts?: { lang?: Lang; theme?: Theme }) {
    if (!this.highlighter) {
      if (!this.initPromise) {
        this.initPromise = this.init();
      }
      
      try {
        await this.initPromise;
      } catch (error) {
        console.error('Error during Shiki initialization:', error);
        throw error;
      }
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
