// service.js
const express = require('express');
const axios = require('axios');

class BeritaIndoApiNext {
  constructor() {
    this.baseUrl = 'https://berita-indo-api-next.vercel.app/api';
    this.sources = ['cnbc-news', 'cnn-news', 'republika-news'];
  }

  formatDate(date) {
    const now = new Date();
    const dateData = new Date(date);
    const differenceSecond = Math.floor((now - dateData) / 1000);

    if (differenceSecond < 60) {
      return 'beberapa detik yang lalu';
    } else if (differenceSecond < 3600) {
      const minute = Math.floor(differenceSecond / 60);
      return `${minute} ${minute === 1 ? 'menit' : 'menit'} yang lalu`;
    } else if (differenceSecond < 86400) {
      const hour = Math.floor(differenceSecond / 3600);
      return `${hour} ${hour === 1 ? 'jam' : 'jam'} yang lalu`;
    } else {
      const difference = Math.floor(differenceSecond / (3600 * 24));
      return `${difference} ${difference === 1 ? 'hari' : 'hari'} yang lalu`;
    }
  }

  // Mendapatkan kategori untuk sumber berita tertentu
  async getCategories(source) {
    try {
      const response = await axios.get(this.baseUrl);
      const data = response.data;
      
      // Map nama sumber ke format yang sesuai dengan API
      const sourceMap = {
        'cnbc-news': 'CNBC News',
        'cnn-news': 'CNN News',
        'republika-news': 'Republika News'
      };
      
      return data.data[sourceMap[source]].listType;
    } catch (error) {
      console.error(`Error fetching categories for ${source}:`, error);
      throw new Error('Failed to fetch categories');
    }
  }

  // Mendapatkan berita untuk sumber dan kategori tertentu
  async getNews(source, category) {
    try {
      const response = await axios.get(`${this.baseUrl}/${source}/${category}`);
      const items = response.data.data;
      
      return {
        data_news: items.map(item => ({
          id: item.id,
          name: source,
          title: item.title,
          date: this.formatDate(item.isoDate),
          link: item.link,
          image: item.image?.medium || item.image?.small || item.image,
          icon_url: item.icon_url,
          timestamp: new Date(item.isoDate).getTime(),
          source: source,
          category: category
        }))
      };
    } catch (error) {
      console.error(`Error fetching news for ${source}/${category}:`, error);
      throw new Error('Failed to fetch news');
    }
  }
}

// Contoh penggunaan dalam route
const router = express.Router();
const beritaIndoApiNext = new BeritaIndoApiNext();

// Route untuk mendapatkan kategori
router.get('/:source/categories', async (req, res) => {
  try {
    const { source } = req.params;
    let categories;
    
    if (beritaIndoApiNext.sources.includes(source)) {
      categories = await beritaIndoApiNext.getCategories(source);
    } else {
      throw new Error('Invalid source');
    }
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route untuk mendapatkan berita
router.get('/:source/:category', async (req, res) => {
  try {
    const { source, category } = req.params;
    let news;
    
    if (beritaIndoApiNext.sources.includes(source)) {
      news = await beritaIndoApiNext.getNews(source, category);
    } else {
      throw new Error('Invalid source');
    }
    
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;