const express = require('express');
require('dotenv').config();

// Import controller API
const { fetchFromAPIs, fetchTrendingFromNewsData } = require('./controllers/apiController');

const app = express();
const PORT = process.env.PORT || 4000;
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Health check route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Publisher route - update dengan semua sumber
app.get('/publiser', async (req, res) => {
  try {
    const { rssSources, jsonApiSources } = require('./controllers/apiController');
    
    const publiserAll = { publiser_all: [] };
    
    // Tambahkan RSS sources
    rssSources.forEach(source => {
      publiserAll.publiser_all.push({
        id: source.id,
        name: source.name,
        icon_url: source.icon_url,
        categories: source.categories.map(cat => ({ id: cat.id, name: cat.name })),
        type: 'rss',
        has_categories: source.categories.length > 1
      });
    });
    
    // Tambahkan JSON API sources
    jsonApiSources.forEach(source => {
      publiserAll.publiser_all.push({
        id: source.id,
        name: source.name,
        icon_url: source.icon_url,
        categories: source.categories.map(cat => ({ id: cat.id, name: cat.name })),
        type: 'json',
        has_categories: true
      });
    });

    res.json(publiserAll);
  } catch (error) {
    console.error('Error fetching publishers:', error);
    res.status(500).json({ error: "Failed to fetch publishers" });
  }
});

// Endpoint untuk mendapatkan kategori dari sumber tertentu
app.get('/:source/kategori', async (req, res) => {
  try {
    const { source } = req.params;
    const { getSourceCategories } = require('./controllers/apiController');
    
    const categories = getSourceCategories(source);
    
    if (categories.length === 0) {
      return res.status(404).json({ 
        error: "Source not found or no categories available",
        source: source
      });
    }
    
    res.json({
      source: source,
      categories: categories,
      total: categories.length
    });
  } catch (error) {
    console.error(`Error fetching categories for ${req.params.source}:`, error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Endpoint untuk mendapatkan semua kategori
app.get('/kategori/semua', async (req, res) => {
  try {
    const { getAllCategories } = require('./controllers/apiController');
    
    const categories = getAllCategories();
    
    res.json({
      categories: categories,
      total: categories.length
    });
  } catch (error) {
    console.error('Error fetching all categories:', error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Endpoint terbaru - langsung dari API
app.get('/terbaru', async (req, res) => {
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API request timed out')), 8000)
    );
    
    const dataPromise = fetchFromAPIs();
    
    const mergedData = await Promise.race([dataPromise, timeoutPromise]);
    res.json(mergedData);
  } catch (error) {
    console.error('Error fetching latest news:', error);
    res.status(503).json({ 
      error: error.message || "Service unavailable", 
      message: "Failed to fetch latest news from APIs"
    });
  }
});

// Endpoint berita - langsung dari API (menggantikan MySQL)
app.get('/berita', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const newsData = await fetchFromAPIs();
    
    // Filter dan limit data
    const filteredData = newsData.merger_api.slice(0, limit);
    
    res.json({
      data: filteredData,
      nextCursor: filteredData.length > 0 ? 
        filteredData[filteredData.length - 1].timestamp : 
        null
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Endpoint trending
app.get('/trending', async (req, res) => {
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Trending API request timed out')), 5000)
    );
    
    const trendingPromise = fetchTrendingFromNewsData();
    const trendingData = await Promise.race([trendingPromise, timeoutPromise]);
    res.json(trendingData);
  } catch (error) {
    console.error('Error fetching trending data:', error);
    res.status(503).json({ error: "Service unavailable", message: "Failed to fetch trending data" });
  }
});

// Source-specific news
app.get('/berita/:source', async (req, res) => {
  try {
    const { source } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const { fetchNewsFromSource } = require('./controllers/apiController');
    const news = await fetchNewsFromSource(source);
    
    const limitedNews = news.slice(0, limit);
    
    res.json({
      source: source,
      data: limitedNews,
      total: limitedNews.length,
      nextCursor: limitedNews.length > 0 ? limitedNews[limitedNews.length - 1].timestamp : null
    });
  } catch (error) {
    console.error(`Error fetching news from ${req.params.source}:`, error);
    res.status(500).json({ error: "Failed to fetch source news" });
  }
});

// Endpoint untuk sumber tertentu dengan kategori
app.get('/berita/:source/:kategori?', async (req, res) => {
  try {
    const { source, kategori } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const { fetchNewsFromSource } = require('./controllers/apiController');
    const news = await fetchNewsFromSource(source, kategori || null);
    
    // Urutkan berdasarkan timestamp
    news.sort((a, b) => b.timestamp - a.timestamp);
    
    const limitedNews = news.slice(0, limit);
    
    res.json({
      source: source,
      category: kategori || 'all',
      data: limitedNews,
      total: limitedNews.length,
      nextCursor: limitedNews.length > 0 ? limitedNews[limitedNews.length - 1].timestamp : null
    });
  } catch (error) {
    console.error(`Error fetching news from ${req.params.source}:`, error);
    res.status(500).json({ error: "Failed to fetch source news" });
  }
});

// Endpoint untuk berita berdasarkan kategori global
app.get('/kategori/:kategori', async (req, res) => {
  try {
    const { kategori } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const { fetchFromAPIs } = require('./controllers/apiController');
    const allNews = await fetchFromAPIs();
    
    // Filter berita berdasarkan kategori
    const filteredNews = allNews.merger_api.filter(item => 
      item.category && item.category.toLowerCase() === kategori.toLowerCase()
    );
    
    // Urutkan dan limit
    filteredNews.sort((a, b) => b.timestamp - a.timestamp);
    const limitedNews = filteredNews.slice(0, limit);
    
    res.json({
      category: kategori,
      data: limitedNews,
      total: limitedNews.length,
      nextCursor: limitedNews.length > 0 ? limitedNews[limitedNews.length - 1].timestamp : null
    });
  } catch (error) {
    console.error(`Error fetching news for category ${req.params.kategori}:`, error);
    res.status(500).json({ error: "Failed to fetch category news" });
  }
});

// Helper function untuk format tanggal
function formatDate(date) {
  const now = new Date();
  const dateData = new Date(date);
  const differenceSecond = Math.floor((now - dateData) / 1000);

  if (differenceSecond < 60) {
    return 'beberapa detik yang lalu';
  } else if (differenceSecond < 3600) {
    const minute = Math.floor(differenceSecond / 60);
    return `${minute} menit yang lalu`;
  } else if (differenceSecond < 86400) {
    const hour = Math.floor(differenceSecond / 3600);
    return `${hour} jam yang lalu`;
  } else {
    const difference = Math.floor(differenceSecond / (3600 * 24));
    return `${difference} hari yang lalu`;
  }
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 404, message: 'Not Found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`API listening on PORT ${PORT}`);
});

module.exports = app;