const express = require('express');
const router = express.Router();
const axios = require('axios');
const axiosRetry = require('axios-retry').default;
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

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
    const dataSource = data.endpoints.find(endpoint => endpoint.name === 'tempo');
    if (!dataSource) {
      throw new Error('Tempo endpoint not found');
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
  const apiUrl = `https://api-berita-indonesia.vercel.app/tempo/${category}/`;
  const dataNews = { data_news: [] };

  function formatDate(date) {
    const now = new Date();
    const dateData = new Date(date);
    const differenceSecond = Math.floor((now - dateData) / 1000);

    if (differenceSecond < 60) {
      return 'beberapa detik yang lalu';
    } else if (differenceSecond < 3600) {
      return `${Math.floor(differenceSecond / 60)} menit yang lalu`;
    } else if (differenceSecond < 86400) {
      return `${Math.floor(differenceSecond / 3600)} jam yang lalu`;
    } else {
      return `${Math.floor(differenceSecond / (3600 * 24))} hari yang lalu`;
    }
  }

  let attempt = 0;
  const maxRetries = 3;

  while (attempt < maxRetries) {
    try {
      const response = await axios.get(apiUrl, { timeout: 5000 });
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

      return dataNews; // Berhasil, keluar dari fungsi
    } catch (error) {
      attempt++;
      console.error(`Error fetching data for category ${category} (Attempt ${attempt}):`, error.message);

      if (attempt >= maxRetries) {
        console.error(`Skipping category ${category} after ${maxRetries} failed attempts.`);
        return { data_news: [] }; // Jika gagal setelah 3 kali retry, tetap lanjut tanpa menghentikan program
      }
    }
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
