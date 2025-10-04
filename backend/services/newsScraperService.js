/**
 * News Scraper Service
 * Automatically fetches news and updates from Ministry of Education and other sources
 */

const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('../models/Article');

class NewsScraperService {
  constructor() {
    this.sources = [
      {
        name: 'Ministry of Education',
        url: 'https://www.men.gov.ma/Ar/Pages/Actualites.aspx', // Morocco Ministry of Education
        selector: '.news-item',
        category: 'ministry'
      },
      {
        name: 'Education News',
        url: 'https://www.educationnews.org/category/higher-education/',
        selector: 'article',
        category: 'education'
      }
    ];
  }

  /**
   * Fetch news from all configured sources
   */
  async fetchAllNews() {
    console.log('🔄 Starting automated news fetching...');
    const results = [];

    for (const source of this.sources) {
      try {
        console.log(`📰 Fetching from ${source.name}...`);
        const articles = await this.fetchFromSource(source);
        results.push(...articles);
        console.log(`✅ Fetched ${articles.length} articles from ${source.name}`);
      } catch (error) {
        console.error(`❌ Error fetching from ${source.name}:`, error.message);
      }
    }

    console.log(`🎉 Total articles fetched: ${results.length}`);
    return results;
  }

  /**
   * Fetch news from a specific source
   */
  async fetchFromSource(source) {
    try {
      const response = await axios.get(source.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const articles = [];

      // Generic scraping - can be customized per source
      $(source.selector).each((index, element) => {
        if (index >= 10) return false; // Limit to 10 articles per source

        const $el = $(element);
        const title = this.extractText($el, 'h1, h2, h3, .title, .headline');
        const summary = this.extractText($el, 'p, .summary, .excerpt, .description');
        const link = this.extractLink($el, 'a');
        const date = this.extractDate($el, '.date, .published, time');
        const inlineImg = this.extractImage($el, source.url);

        if (title && summary) {
          articles.push({
            title: this.cleanText(title),
            summary: this.cleanText(summary),
            content: this.generateContent(title, summary),
            source: source.name,
            category: source.category,
            externalUrl: link,
            publishedAt: date || new Date(),
            isImportant: this.isImportantNews(title, summary),
            tags: this.extractTags(title, summary),
            visibility: 'public',
            status: 'published',
            imageUrl: inlineImg || null
          });
        }
      });

      // Enrich with Open Graph images when inline image is missing
      for (const art of articles) {
        if (!art.imageUrl && art.externalUrl) {
          try {
            const og = await this.fetchOpenGraphImage(art.externalUrl);
            if (og) art.imageUrl = og;
          } catch (e) {
            // ignore per-article OG failures
          }
        }
      }

      return articles;
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error.message);
      return [];
    }
  }

  /**
   * Extract text from element using multiple selectors
   */
  extractText($element, selectors) {
    const selectorList = selectors.split(', ');
    for (const selector of selectorList) {
      const text = $element.find(selector).first().text().trim();
      if (text) return text;
    }
    return $element.text().trim();
  }

  /**
   * Extract link from element
   */
  extractLink($element, selector) {
    const href = $element.find(selector).first().attr('href') || $element.attr('href');
    if (!href) return null;
    return this.resolveUrl(href, 'https://www.men.gov.ma');
  }

  /**
   * Extract date from element
   */
  extractDate($element, selectors) {
    const selectorList = selectors.split(', ');
    for (const selector of selectorList) {
      const dateText = $element.find(selector).first().text().trim();
      if (dateText) {
        const date = new Date(dateText);
        if (!isNaN(date.getTime())) return date;
      }
    }
    return new Date();
  }

  /**
   * Extract image URL from element
   */
  extractImage($element, baseUrl) {
    // common image selectors
    const $img = $element.find('img').first();
    const src = ($img.attr('data-src') || $img.attr('src') || '').trim();
    if (!src) return null;
    return this.resolveUrl(src, baseUrl);
  }

  /**
   * Resolve a possibly relative URL against a base
   */
  resolveUrl(url, base) {
    try {
      const u = new URL(url, base);
      return u.href;
    } catch {
      return url;
    }
  }

  /**
   * Fetch Open Graph/Twitter image from a page
   */
  async fetchOpenGraphImage(pageUrl) {
    try {
      const res = await axios.get(pageUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const $ = cheerio.load(res.data);
      const og = $('meta[property="og:image"]').attr('content') || $('meta[name="og:image"]').attr('content');
      const tw = $('meta[name="twitter:image"]').attr('content') || $('meta[property="twitter:image"]').attr('content');
      const href = og || tw || '';
      if (!href) return null;
      return this.resolveUrl(href, pageUrl);
    } catch (e) {
      return null;
    }
  }

  /**
   * Clean and format text
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,!?()]/g, '')
      .trim()
      .substring(0, 500); // Limit length
  }

  /**
   * Generate full content from title and summary
   */
  generateContent(title, summary) {
    return `# ${title}

${summary}

---

*This article was automatically imported from an external source. For the most up-to-date information, please visit the original source.*

## Key Points:
- Important educational update
- Relevant to students and faculty
- Official announcement

For more details and official documentation, please check the Ministry of Education website or contact the academic office.`;
  }

  /**
   * Determine if news is important based on keywords
   */
  isImportantNews(title, summary) {
    const importantKeywords = [
      'urgent', 'important', 'deadline', 'exam', 'registration',
      'scholarship', 'emergency', 'closure', 'announcement',
      'مهم', 'عاجل', 'إعلان', 'امتحان', 'منحة' // Arabic keywords
    ];

    const text = (title + ' ' + summary).toLowerCase();
    return importantKeywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  /**
   * Extract relevant tags from content
   */
  extractTags(title, summary) {
    const text = (title + ' ' + summary).toLowerCase();
    const tags = [];

    const tagKeywords = {
      'scholarship': ['scholarship', 'grant', 'funding', 'منحة'],
      'exam': ['exam', 'test', 'assessment', 'امتحان'],
      'registration': ['registration', 'enrollment', 'تسجيل'],
      'announcement': ['announcement', 'notice', 'إعلان'],
      'deadline': ['deadline', 'due date', 'موعد'],
      'education': ['education', 'academic', 'university', 'تعليم'],
      'ministry': ['ministry', 'government', 'official', 'وزارة']
    };

    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        tags.push(tag);
      }
    }

    return tags;
  }

  /**
   * Save articles to database (avoiding duplicates)
   */
  async saveArticles(articles, authorId) {
    const savedArticles = [];

    for (const articleData of articles) {
      try {
        // Check if article already exists (by title)
        const existingArticle = await Article.findOne({
          title: articleData.title,
          source: articleData.source
        });

        if (!existingArticle) {
          const images = [];
          if (articleData.imageUrl) {
            images.push({
              filename: 'external.jpg',
              originalName: 'external',
              url: articleData.imageUrl,
              alt: articleData.title || '',
              caption: articleData.source || ''
            });
          }

          const article = new Article({
            ...articleData,
            images,
            author: authorId
          });

          await article.save();
          savedArticles.push(article);
          console.log(`✅ Saved: ${article.title}`);
        } else {
          console.log(`⏭️ Skipped duplicate: ${articleData.title}`);
        }
      } catch (error) {
        console.error(`❌ Error saving article: ${articleData.title}`, error.message);
      }
    }

    return savedArticles;
  }

  /**
   * Manual news fetch with RSS feeds (alternative method)
   */
  async fetchFromRSS(rssUrl, category = 'news') {
    try {
      const Parser = require('rss-parser');
      const parser = new Parser();
      const feed = await parser.parseURL(rssUrl);

      const results = [];
      for (const item of feed.items.slice(0, 10)) {
        const title = this.cleanText(item.title || '');
        const summary = this.cleanText(item.contentSnippet || item.content || '');
        if (!title || !summary) continue;

        // Try enclosure image first
        const enclosureUrl = item.enclosure?.url || item.enclosures?.[0]?.url;
        let imageUrl = enclosureUrl || null;
        if (!imageUrl && item.link) {
          imageUrl = await this.fetchOpenGraphImage(item.link);
        }

        results.push({
          title,
          summary,
          content: this.generateContent(item.title, item.contentSnippet || item.content || ''),
          source: feed.title || 'RSS Feed',
          category: category,
          externalUrl: item.link,
          publishedAt: new Date(item.pubDate || item.isoDate || Date.now()),
          isImportant: this.isImportantNews(item.title || '', item.contentSnippet || ''),
          tags: this.extractTags(item.title || '', item.contentSnippet || ''),
          visibility: 'public',
          status: 'published',
          imageUrl
        });
      }

      return results;
    } catch (error) {
      console.error('Error fetching RSS:', error.message);
      return [];
    }
  }

  /**
   * Fetch news from multiple RSS sources
   */
  async fetchFromMultipleRSS() {
    const rssSources = [
      { url: 'https://www.universityworldnews.com/rss.php', category: 'education' },
      { url: 'https://www.insidehighered.com/rss.xml', category: 'education' },
      { url: 'https://feeds.feedburner.com/EducationWeek', category: 'education' }
    ];

    const allArticles = [];

    for (const source of rssSources) {
      try {
        console.log(`📡 Fetching RSS from ${source.url}...`);
        const articles = await this.fetchFromRSS(source.url, source.category);
        allArticles.push(...articles);
        console.log(`✅ Fetched ${articles.length} articles from RSS`);
      } catch (error) {
        console.error(`❌ RSS fetch error:`, error.message);
      }
    }

    return allArticles;
  }
}

module.exports = NewsScraperService;
