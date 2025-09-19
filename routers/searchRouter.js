const express = require('express');
const axios = require('axios');
const router = express.Router();
const { fetchNewsFromSource, rssSources, jsonApiSources } = require('../controllers/apiController');

function formatDate(date) {
  const now = new Date();
  const dateData = new Date(date);
  const differenceSecond = Math.floor((now - dateData) / 1000);

  if (differenceSecond < 60) return 'beberapa detik yang lalu';
  if (differenceSecond < 3600) return `${Math.floor(differenceSecond / 60)} menit yang lalu`;
  if (differenceSecond < 86400) return `${Math.floor(differenceSecond / 3600)} jam yang lalu`;
  return `${Math.floor(differenceSecond / (3600 * 24))} hari yang lalu`;
}

async function searchNews(keyword, category = null) {
  let searchResults = [];
  const allSources = [...rssSources, ...jsonApiSources];

  for (const source of allSources) {
    try {
      let articles = [];
      
      if (source.categories && source.categories[0].url) {
        // RSS source
        for (const cat of source.categories) {
          if (category && cat.id !== category) continue;
          
          const { fetchRSSFeed } = require('../controllers/apiController');
          const feedArticles = await fetchRSSFeed(cat.url, source.id);
          articles = articles.concat(feedArticles.map(article => ({
            ...article,
            source: source.id,
            name: source.name,
            icon_url: source.icon_url,
            category: cat.id
          })));
        }
      } else {
        // JSON API source  
        for (const cat of source.categories) {
          if (category && cat.id !== category) continue;
          
          try {
            const apiUrl = `${source.url}/${cat.id}`;
            const response = await axios.get(apiUrl, { timeout: 5000 });
            const feedArticles = response.data.data || [];
            
            articles = articles.concat(feedArticles.map(item => ({
              id: item.id || `${source.id}-${Date.now()}-${Math.random()}`,
              name: source.name,
              title: item.title,
              date: formatDate(item.isoDate),
              link: item.link,
              image: item.image ? item.image.medium || item.image.small || item.image : '',
              icon_url: source.icon_url,
              timestamp: new Date(item.isoDate).getTime(),
              source: source.id,
              category: cat.id
            })));
          } catch (error) {
            console.error(`Error fetching ${source.name} (${cat.name}):`, error.message);
          }
        }
      }

      const filteredData = articles.filter(item =>
        item.title && item.title.toLowerCase().includes(keyword.toLowerCase())
      ).map(item => ({
        id: item.id,
        source: source.name,
        title: item.title,
        date: item.date || formatDate(item.published || item.isoDate),
        link: item.link,
        image: item.image || '',
        icon_url: source.icon_url,
        timestamp: item.timestamp || new Date(item.published || item.isoDate).getTime(),
        category: item.category
      }));

      searchResults = searchResults.concat(filteredData);
    } catch (error) {
      console.error(`Error searching ${source.name}:`, error.message);
    }
  }

  return searchResults;
}

router.get('/', async (req, res) => {
  const { keyword, category } = req.query;

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  try {
    const results = await searchNews(keyword, category || null);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;