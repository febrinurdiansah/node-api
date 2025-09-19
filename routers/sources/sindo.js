const express = require('express');
const router = express.Router();
const axios = require('axios');

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

async function fetchCategories() {
  const apiUrl = 'https://api-berita-indonesia.vercel.app/';
  try {
    const response = await axios.get(apiUrl);
    const data = response.data;
    // Memfilter endpoint dengan nama 
    const dataSource = data.endpoints.find(endpoint => endpoint.name === 'sindonews');
    if (!dataSource) {
      throw new Error('Sindo endpoint not found');
    }
    // Mengambil daftar kategori dari endpoint 
    const categories = dataSource.paths.map(path => path.name);
    return categories;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
}

// Endpoint untuk menampilkan kategori
router.get('/', async (req, res) => {
  try {
    const categories = await fetchCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Func GET sumber dan kategori
async function fetchData(category) {
  const apiUrl = `https://api-berita-indonesia.vercel.app/sindonews/${category}/`;
  const dataNews = { data_news: [] };

  function formatDate(date) {
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

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;
    const posts = data.data.posts;

    for (const post of posts) {
      dataNews.data_news.push({
        id: post.id,
        title: post.title,
        date: formatDate(post.pubDate),
        link: post.link,
        image: post.thumbnail,
        icon_url: post.icon_url,
        timestamp: new Date(post.pubDate).getTime(),
      });
    }

    return dataNews;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
}

// Endpoint data kategori berita 
router.get('/:category', async (req, res) => {
  const { category } = req.params;

  try {
    const data = await fetchData(category);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
