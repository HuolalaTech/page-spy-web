import { BUNDLED_LANGUAGES, Highlighter, Lang } from 'shiki';

class ShikiHighlighter {
  private highlighter: Highlighter | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    this.highlighter = await window.shiki.getHighlighter({
      theme: 'github-dark',
      langs: ['js', 'jsx', 'ts', 'tsx', 'mdx', 'vue', 'html'],
    });
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public async get(lang?: Lang) {
    if (!this.highlighter) {
      await this.init();
    }
    if (lang && !this.highlighter?.getLoadedLanguages().includes(lang)) {
      const bundles = BUNDLED_LANGUAGES.filter((bundle) => {
        return bundle.id === lang || bundle.aliases?.includes(lang);
      });
      if (bundles.length > 0) {
        await this.highlighter?.loadLanguage(lang);
      }
    }
    return this.highlighter!;
  }
}

const sh = new ShikiHighlighter();
export default sh;
