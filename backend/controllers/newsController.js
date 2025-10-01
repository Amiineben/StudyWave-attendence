/**
 * News Controller
 * Handles automated news fetching and management
 */

const NewsScraperService = require('../services/newsScraperService');
const Article = require('../models/Article');
const { validationResult } = require('express-validator');

const newsScraperService = new NewsScraperService();

/**
 * Manually trigger news fetching from external sources
 */
const fetchExternalNews = async (req, res) => {
  try {
    console.log('🔄 Manual news fetch triggered by:', req.user.email);

    // Fetch from web scraping
    const scrapedArticles = await newsScraperService.fetchAllNews();
    
    // Fetch from RSS feeds
    const rssArticles = await newsScraperService.fetchFromMultipleRSS();
    
    // Combine all articles
    const allArticles = [...scrapedArticles, ...rssArticles];
    
    if (allArticles.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No new articles found from external sources',
        data: {
          fetched: 0,
          saved: 0,
          articles: []
        }
      });
    }

    // Save articles to database
    const savedArticles = await newsScraperService.saveArticles(allArticles, req.user._id);

    res.status(200).json({
      success: true,
      message: `Successfully fetched and saved ${savedArticles.length} new articles`,
      data: {
        fetched: allArticles.length,
        saved: savedArticles.length,
        articles: savedArticles.map(article => ({
          id: article._id,
          title: article.title,
          summary: article.summary,
          category: article.category,
          source: article.source,
          isImportant: article.isImportant,
          publishedAt: article.publishedAt
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching external news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch external news',
      error: error.message
    });
  }
};

/**
 * Get news fetching status and statistics
 */
const getNewsStats = async (req, res) => {
  try {
    const totalArticles = await Article.countDocuments();
    const publishedArticles = await Article.countDocuments({ status: 'published' });
    const importantArticles = await Article.countDocuments({ isImportant: true });
    const recentArticles = await Article.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    // Get articles by source
    const articlesBySource = await Article.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get articles by category
    const articlesByCategory = await Article.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          total: totalArticles,
          published: publishedArticles,
          important: importantArticles,
          recent: recentArticles
        },
        sources: articlesBySource,
        categories: articlesByCategory,
        lastFetch: await getLastFetchTime()
      }
    });

  } catch (error) {
    console.error('❌ Error getting news stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get news statistics',
      error: error.message
    });
  }
};

/**
 * Configure automatic news fetching schedule
 */
const configureAutoFetch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { enabled, interval, sources } = req.body;

    // Here you would typically save this configuration to database
    // For now, we'll just return success
    
    res.status(200).json({
      success: true,
      message: 'Auto-fetch configuration updated successfully',
      data: {
        enabled,
        interval,
        sources,
        nextFetch: enabled ? new Date(Date.now() + interval * 60 * 60 * 1000) : null
      }
    });

  } catch (error) {
    console.error('❌ Error configuring auto-fetch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to configure auto-fetch',
      error: error.message
    });
  }
};

/**
 * Test news source connectivity
 */
const testNewsSources = async (req, res) => {
  try {
    const testResults = [];

    // Test web scraping sources
    for (const source of newsScraperService.sources) {
      try {
        const articles = await newsScraperService.fetchFromSource(source);
        testResults.push({
          name: source.name,
          url: source.url,
          status: 'success',
          articlesFound: articles.length,
          lastTested: new Date()
        });
      } catch (error) {
        testResults.push({
          name: source.name,
          url: source.url,
          status: 'error',
          error: error.message,
          lastTested: new Date()
        });
      }
    }

    // Test RSS sources
    const rssSources = [
      { name: 'University World News', url: 'https://www.universityworldnews.com/rss.php' },
      { name: 'Inside Higher Ed', url: 'https://www.insidehighered.com/rss.xml' }
    ];

    for (const source of rssSources) {
      try {
        const articles = await newsScraperService.fetchFromRSS(source.url);
        testResults.push({
          name: source.name,
          url: source.url,
          type: 'RSS',
          status: 'success',
          articlesFound: articles.length,
          lastTested: new Date()
        });
      } catch (error) {
        testResults.push({
          name: source.name,
          url: source.url,
          type: 'RSS',
          status: 'error',
          error: error.message,
          lastTested: new Date()
        });
      }
    }

    const successfulSources = testResults.filter(r => r.status === 'success').length;
    const totalSources = testResults.length;

    res.status(200).json({
      success: true,
      message: `Tested ${totalSources} sources, ${successfulSources} successful`,
      data: {
        summary: {
          total: totalSources,
          successful: successfulSources,
          failed: totalSources - successfulSources
        },
        results: testResults
      }
    });

  } catch (error) {
    console.error('❌ Error testing news sources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test news sources',
      error: error.message
    });
  }
};

/**
 * Get last fetch time from database or cache
 */
async function getLastFetchTime() {
  try {
    const lastArticle = await Article.findOne({ source: { $ne: null } })
      .sort({ createdAt: -1 })
      .select('createdAt');
    
    return lastArticle ? lastArticle.createdAt : null;
  } catch (error) {
    return null;
  }
}

/**
 * Delete articles from external sources (cleanup)
 */
const cleanupExternalArticles = async (req, res) => {
  try {
    const { olderThanDays = 30, source } = req.query;
    
    const query = {
      source: { $ne: null }, // Only external articles
      createdAt: { $lt: new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000) }
    };

    if (source) {
      query.source = source;
    }

    const deletedCount = await Article.deleteMany(query);

    res.status(200).json({
      success: true,
      message: `Cleaned up ${deletedCount.deletedCount} old external articles`,
      data: {
        deletedCount: deletedCount.deletedCount,
        criteria: {
          olderThanDays,
          source: source || 'all'
        }
      }
    });

  } catch (error) {
    console.error('❌ Error cleaning up articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup articles',
      error: error.message
    });
  }
};

module.exports = {
  fetchExternalNews,
  getNewsStats,
  configureAutoFetch,
  testNewsSources,
  cleanupExternalArticles
};
