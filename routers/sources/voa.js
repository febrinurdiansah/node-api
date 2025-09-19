const express = require('express');
const router = express.Router();
const axios = require('axios');

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

async function fetchCategories() {
  const apiUrl = 'https://berita-indo-api-next.vercel.app/api';
  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    const categories = data.data['VOA News'].listType;
    return categories;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
}

router.get('/', async (req, res) => {
  try {
    const data = await fetchData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchData() {
  const apiUrl = 'https://berita-indo-api-next.vercel.app/api/voa-news'; 
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
    const items = data.data;

    for (const item of items) {
      let imageUrl = '';
      if (typeof item.image === 'object') {
        if ('medium' in item.image) {
          imageUrl = item.image.medium;
        } else if ('small' in item.image) {
          imageUrl = item.image.small;
        } else {
          imageUrl = item.image;
        }
      } else {
        imageUrl = item.image;
      }

      dataNews.data_news.push({
        id: item.id,
        name: item.name,
        title: item.title,
        date: formatDate(item.isoDate),
        link: item.link,
        image: imageUrl,
        icon_url: item.icon_url,
        timestamp: new Date(item.isoDate).getTime(),
      });
    }

    return dataNews;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
}


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
