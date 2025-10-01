/**
 * Test Articles Script
 * Tests article creation and retrieval
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Article = require('../models/Article');
const User = require('../models/User');

async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studywave';
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

async function testArticles() {
  console.log('📰 Testing Articles...\n');
  
  try {
    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ No admin user found');
      return;
    }

    console.log('👤 Found admin user:', admin.name);

    // Test creating a simple article
    console.log('\n📝 Creating test article...');
    
    const testArticle = new Article({
      title: 'Test News Article',
      summary: 'This is a test news article to verify the system is working.',
      content: 'This is the full content of the test news article. It should be saved successfully.',
      author: admin._id,
      category: 'news',
      status: 'published',
      tags: ['test', 'news'],
      publishedAt: new Date(),
      visibility: 'public'
    });

    console.log('📄 Article data:', {
      title: testArticle.title,
      category: testArticle.category,
      status: testArticle.status,
      author: admin.name,
      hasCourse: !!testArticle.course
    });

    await testArticle.save();
    console.log('✅ Test article created successfully with ID:', testArticle._id);

    // Test retrieving articles
    console.log('\n📚 Retrieving all articles...');
    const articles = await Article.find({ status: 'published' })
      .populate('author', 'name email role')
      .sort({ publishedAt: -1 });

    console.log(`📊 Found ${articles.length} published articles:`);
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Category: ${article.category}`);
      console.log(`   Author: ${article.author?.name || 'Unknown'}`);
      console.log(`   Course: ${article.course ? 'Yes' : 'No'}`);
      console.log(`   Published: ${article.publishedAt?.toLocaleDateString() || 'Not set'}`);
      console.log('');
    });

    // Test API format
    console.log('🔄 Testing API response format...');
    const apiResponse = {
      success: true,
      data: {
        articles: articles.map(article => ({
          _id: article._id,
          title: article.title,
          summary: article.summary,
          content: article.content,
          category: article.category,
          status: article.status,
          isImportant: article.isImportant,
          tags: article.tags,
          publishedAt: article.publishedAt,
          createdAt: article.createdAt,
          author: article.author,
          course: article.course,
          images: article.images
        })),
        pagination: {
          total: articles.length,
          page: 1,
          limit: 10,
          pages: Math.ceil(articles.length / 10)
        }
      }
    };

    console.log('📡 API Response structure:', {
      success: apiResponse.success,
      articleCount: apiResponse.data.articles.length,
      hasAuthor: !!apiResponse.data.articles[0]?.author,
      firstArticleTitle: apiResponse.data.articles[0]?.title
    });

    return articles;

  } catch (error) {
    console.error('❌ Error testing articles:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n')[0]
    });
    return [];
  }
}

async function main() {
  console.log('📰 StudyWave Articles Test\n');
  
  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  try {
    const articles = await testArticles();
    
    console.log('\n🎉 Article testing completed!');
    console.log(`📊 Total articles found: ${articles.length}`);
    
    if (articles.length === 0) {
      console.log('\n💡 No articles found. Try running:');
      console.log('   npm run seed');
      console.log('   npm run add-news');
    }
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📴 Database connection closed');
  }
}

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { testArticles };
