const axios = require('axios');
const xml2js = require('xml2js');

// Konfigurasi semua sumber RSS
const rssSources = [
  // BBC Indonesia - berbagai kategori
  {
    id: 'bbc',
    name: 'BBC Indonesia',
    icon_url: 'https://www.bbc.co.uk/indonesia/images/gel/rss_logo.gif',
    categories: [
      { id: 'terkini', name: 'Berita Terkini', url: 'http://www.bbc.co.uk/indonesia/index.xml' },
      { id: 'dunia', name: 'Berita Dunia', url: 'http://www.bbc.co.uk/indonesia/dunia/index.xml' },
      { id: 'indonesia', name: 'Berita Indonesia', url: 'http://www.bbc.co.uk/indonesia/berita_indonesia/index.xml' },
      { id: 'olahraga', name: 'Olahraga', url: 'http://www.bbc.co.uk/indonesia/olahraga/index.xml' },
      { id: 'majalah', name: 'Majalah', url: 'http://www.bbc.co.uk/indonesia/majalah/index.xml' },
      { id: 'bahasa_inggris', name: 'Bahasa Inggris', url: 'http://www.bbc.co.uk/indonesia/bahasa_inggris/index.xml' }
    ]
  },

  // ANTARA News - berbagai kategori
  {
    id: 'antara',
    name: 'ANTARA News',
    icon_url: 'https://pbs.twimg.com/profile_images/1193345348573396992/Cd3dfZfq_400x400.jpg',
    categories: [
      { id: 'terkini', name: 'Berita Terkini', url: 'https://www.antaranews.com/rss/terkini.xml' },
      { id: 'top', name: 'Top News', url: 'https://www.antaranews.com/rss/top-news.xml' },
      { id: 'politik', name: 'Politik', url: 'https://www.antaranews.com/rss/politik.xml' },
      { id: 'hukum', name: 'Hukum', url: 'https://www.antaranews.com/rss/hukum.xml' },
      { id: 'ekonomi', name: 'Ekonomi', url: 'https://www.antaranews.com/rss/ekonomi.xml' },
      { id: 'metro', name: 'Metro', url: 'https://www.antaranews.com/rss/metro.xml' },
      { id: 'olahraga', name: 'Olahraga', url: 'https://www.antaranews.com/rss/olahraga.xml' },
      { id: 'humaniora', name: 'Humaniora', url: 'https://www.antaranews.com/rss/humaniora.xml' },
      { id: 'hiburan', name: 'Hiburan', url: 'https://www.antaranews.com/rss/hiburan.xml' },
      { id: 'tekno', name: 'Teknologi', url: 'https://www.antaranews.com/rss/tekno.xml' }
    ]
  },

  // Sindo News
  {
    id: 'sindonews',
    name: 'SINDOnews',
    icon_url: 'https://play-lh.googleusercontent.com/LSgpGO8zgGhnCxTTqJt-LDkOLN97Qc4JPsOZUbnnOjaMY9bP1M3_a3jmW9yt8M00EcM',
    categories: [
      { id: 'terkini', name: 'Berita Terkini', url: 'https://www.sindonews.com/feed' }
    ]
  },

  // VIVA News
  {
    id: 'viva',
    name: 'VIVA News',
    icon_url: 'https://www.viva.co.id/asset-viva/responsive-web/img/logo.png?v=2.101',
    categories: [
      { id: 'terkini', name: 'Berita Terkini', url: 'https://www.viva.co.id/get/all' }
    ]
  },

  // JPNN
  {
    id: 'jpnn',
    name: 'JPNN',
    icon_url: 'https://play-lh.googleusercontent.com/1523518470499205121/EJf01gIy_400x400.jpg',
    categories: [
      { id: 'terkini', name: 'Berita Terkini', url: 'https://www.jpnn.com/index.php?mib=rss' }
    ]
  },

  // FAJAR
  {
    id: 'fajar',
    name: 'FAJAR',
    icon_url: 'https://fajar.co.id/wp-content/uploads/2023/10/cropped-favicon-fajar-100x75.png',
    categories: [
      { id: 'terkini', name: 'Berita Terkini', url: 'https://fajar.co.id/feed' }
    ]
  },

  // WASPADA
  {
    id: 'waspada',
    name: 'WASPADA',
    icon_url: 'https://waspada.co.id/wp-content/uploads/2024/02/cropped-logo-WOL-W-saja-32x32.jpg',
    categories: [
      { id: 'terkini', name: 'Berita Terkini', url: 'https://waspada.co.id/feed' }
    ]
  },

  // Online24jam
  {
    id: 'online24jam',
    name: 'Online24jam',
    icon_url: 'https://online24jam.com/wp-content/uploads/2025/04/cropped-icon-32x32.png',
    categories: [
      { id: 'terkini', name: 'Berita Terkini', url: 'https://online24jam.com/feed' }
    ]
  },

  // Media Indonesia
  {
    id: 'mediaindonesia',
    name: 'Media Indonesia',
    icon_url: 'https://mediaindonesia.com/images/icon.jpg',
    categories: [
      { id: 'terkini', name: 'Berita Terkini', url: 'https://mediaindonesia.com/feed/all' }
    ]
  },

  // KASKUS (forum)
  {
    id: 'kaskus',
    name: 'KASKUS',
    icon_url: 'https://www.kaskus.co.id/favicon.ico',
    categories: [
      { id: 'lounge', name: 'Lounge', url: 'http://www.kaskus.co.id/rss/forum/21' },
      { id: 'berita_politik', name: 'Berita & Politik', url: 'http://www.kaskus.co.id/rss/forum/10' },
      { id: 'games', name: 'Games', url: 'http://www.kaskus.co.id/rss/forum/44' }
    ]
  }
];

// Sumber JSON API (yang sudah ada)
const jsonApiSources = [
  {
    id: 'cnbc',
    name: 'CNBC',
    url: 'https://berita-indo-api-next.vercel.app/api/cnbc-news',
    icon_url: 'https://play-lh.googleusercontent.com/LcfCDnI9fKWMm2orpHjWfd8k4xyIcbuATFekM0kqwni9610PmBF66ZpNLjKjb1giZQ',
    categories: [
      { id: 'market', name: 'Market' },
      { id: 'news', name: 'News' },
      { id: 'entrepreneur', name: 'Entrepreneur' },
      { id: 'syariah', name: 'Syariah' },
      { id: 'tech', name: 'Tech' },
      { id: 'lifestyle', name: 'Lifestyle' }
    ]
  },
  {
    id: "cnn",
    name: "CNN",
    url: "https://berita-indo-api-next.vercel.app/api/cnn-news",
    icon_url: "https://play-lh.googleusercontent.com/oU_CNtPRewrEfBWk3HM6yzZxe4rZQIH8-LRd7GT6m1naLW8wab4m-s1-2ZZuB2O4Lg",
    categories: [
      { id: 'nasional', name: 'Nasional' },
      { id: 'internasional', name: 'Internasional' },
      { id: 'ekonomi', name: 'Ekonomi' },
      { id: 'olahraga', name: 'Olahraga' },
      { id: 'teknologi', name: 'Teknologi' },
      { id: 'hiburan', name: 'Hiburan' },
      { id: 'gaya-hidup', name: 'Gaya Hidup' }
    ]
  },
  {
    id: "republika",
    name: "Republika",
    url: "https://berita-indo-api-next.vercel.app/api/republika-news",
    icon_url: "https://play-lh.googleusercontent.com/jXwOKexaM8q_VTu64SybIW5WndjPQLocSvkxCYG9dpxUfQMw20jiUpXnTnfRW-4_Bg",
    categories: [
      { id: 'news', name: 'News' },
      { id: 'nusantara', name: 'Nusantara' },
      { id: 'khazanah', name: 'Khazanah' },
      { id: 'islam-digest', name: 'Islam Digest' },
      { id: 'internasional', name: 'Internasional' },
      { id: 'ekonomi', name: 'Ekonomi' },
      { id: 'sepakbola', name: 'Sepakbola' },
      { id: 'leisure', name: 'Leisure' }
    ]
  },
  {
    id: "okezone",
    name: "Okezone",
    url: "https://berita-indo-api-next.vercel.app/api/okezone-news",
    icon_url: "https://play-lh.googleusercontent.com/MmKQ-EDZqITAHovSHtJtze7Td9ii4M8sGapowXPqhQsv3qb8ooLwkiRBobAnHHCvNJI1",
    categories: [
      { id: 'breaking', name: 'Breaking' },
      { id: 'sport', name: 'Sport' },
      { id: 'economy', name: 'Economy' },
      { id: 'lifestyle', name: 'Lifestyle' },
      { id: 'celebrity', name: 'Celebrity' },
      { id: 'bola', name: 'Bola' },
      { id: 'techno', name: 'Techno' }
    ]
  }
];

const formatDate = (date) => {
  const now = new Date();
  const dateData = new Date(date);
  const differenceSecond = Math.floor((now - dateData) / 1000);

  if (differenceSecond < 60) return 'beberapa detik yang lalu';
  if (differenceSecond < 3600) return `${Math.floor(differenceSecond / 60)} menit yang lalu`;
  if (differenceSecond < 86400) return `${Math.floor(differenceSecond / 3600)} jam yang lalu`;
  return `${Math.floor(differenceSecond / (3600 * 24))} hari yang lalu`;
};

// Parser untuk berbagai format RSS
const parseRSS = async (xmlData, sourceType = 'default') => {
  try {
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
    const result = await parser.parseStringPromise(xmlData);
    
    let items = [];
    
    switch (sourceType) {
      case 'bbc':
        items = result.feed?.entry || [];
        return items.map(parseBBCItem);
        
      case 'antara':
        items = result.rss?.channel?.item || [];
        return items.map(parseAntaraItem);
        
      case 'sindonews':
        items = result.rss?.channel?.item || [];
        return items.map(parseSindoItem);
        
      case 'viva':
        items = result.rss?.channel?.item || [];
        return items.map(parseVivaItem);
        
      case 'jpnn':
        items = result.rss?.channel?.item || [];
        return items.map(parseJpnnItem);
        
      case 'wordpress': // Untuk FAJAR, WASPADA, Online24jam
        items = result.rss?.channel?.item || [];
        return items.map(parseWordpressItem);
        
      case 'mediaindonesia':
        items = result.rss?.channel?.item || [];
        return items.map(parseMediaIndonesiaItem);
        
      case 'kaskus':
        items = result.rss?.channel?.item || [];
        return items.map(parseKaskusItem);
        
      default:
        items = result.rss?.channel?.item || [];
        return items.map(parseDefaultRSSItem);
    }
  } catch (error) {
    console.error('Error parsing RSS:', error);
    return [];
  }
};

// Parser khusus untuk setiap sumber
const parseBBCItem = (item) => {
  const imageUrl = extractImageFromBBC(item);
  const articleUrl = extractLinkFromBBC(item);
  const pubDate = item.published || item.updated;
  
  return {
    id: item.id || `bbc-${Date.now()}-${Math.random()}`,
    title: item.title?._ || item.title || 'No title',
    summary: item.summary?._ || item.summary || '',
    link: articleUrl,
    image: imageUrl,
    published: pubDate,
    isoDate: pubDate,
    timestamp: new Date(pubDate).getTime()
  };
};

const parseAntaraItem = (item) => {
  const imageUrl = extractImageFromAntara(item);
  
  return {
    id: item.guid || `antara-${Date.now()}-${Math.random()}`,
    title: item.title || 'No title',
    summary: extractTextFromCDATA(item.description) || '',
    link: item.link,
    image: imageUrl,
    published: item.pubDate,
    isoDate: item.pubDate,
    timestamp: new Date(item.pubDate).getTime()
  };
};

const parseSindoItem = (item) => {
  const imageMatch = item.description?.match(/<img[^>]+src="([^">]+)"/);
  const imageUrl = imageMatch ? imageMatch[1] : '';
  
  return {
    id: item.idnews || `sindo-${Date.now()}-${Math.random()}`,
    title: item.title || 'No title',
    summary: extractTextFromCDATA(item.description) || '',
    link: item.link,
    image: imageUrl,
    published: item.pubDate,
    isoDate: item.pubDate,
    timestamp: new Date(item.pubDate).getTime()
  };
};

const parseVivaItem = (item) => {
  const imageMatch = item.description?.match(/<img[^>]+src="([^">]+)"/);
  const imageUrl = imageMatch ? imageMatch[1] : '';
  
  return {
    id: item.guid || `viva-${Date.now()}-${Math.random()}`,
    title: extractTextFromCDATA(item.title) || 'No title',
    summary: extractTextFromCDATA(item.description) || '',
    link: item.link,
    image: imageUrl,
    published: item.pubDate,
    isoDate: item.pubDate,
    timestamp: new Date(item.pubDate).getTime()
  };
};

const parseJpnnItem = (item) => {
  const imageMatch = item.description?.match(/<img[^>]+src="([^">]+)"/);
  const imageUrl = imageMatch ? imageMatch[1] : (item.enclosure?.url || '');
  
  return {
    id: item.guid || `jpnn-${Date.now()}-${Math.random()}`,
    title: item.title || 'No title',
    summary: extractTextFromCDATA(item.description) || '',
    link: item.link,
    image: imageUrl,
    published: item.pubDate,
    isoDate: item.pubDate,
    timestamp: new Date(item.pubDate).getTime()
  };
};

const parseWordpressItem = (item) => {
  return {
    id: item.guid || `wp-${Date.now()}-${Math.random()}`,
    title: item.title || 'No title',
    summary: extractTextFromCDATA(item.description) || '',
    link: item.link,
    image: '',
    published: item.pubDate,
    isoDate: item.pubDate,
    timestamp: new Date(item.pubDate).getTime()
  };
};

const parseMediaIndonesiaItem = (item) => {
  return {
    id: item.guid || `mediaindonesia-${Date.now()}-${Math.random()}`,
    title: extractTextFromCDATA(item.title) || 'No title',
    summary: extractTextFromCDATA(item.description) || '',
    link: item.link,
    image: '',
    published: item.pubDate,
    isoDate: item.pubDate,
    timestamp: new Date(item.pubDate).getTime()
  };
};

const parseKaskusItem = (item) => {
  const imageMatch = item.description?.match(/\[img\]([^\[]+)\[\/img\]/);
  const imageUrl = imageMatch ? imageMatch[1] : '';
  
  return {
    id: item.guid || `kaskus-${Date.now()}-${Math.random()}`,
    title: item.title || 'No title',
    summary: item.description?.replace(/\[img\][^\[]+\[\/img\]/, '').slice(0, 200) || '',
    link: item.link,
    image: imageUrl,
    published: item.pubDate,
    isoDate: item.pubDate,
    timestamp: new Date(item.pubDate).getTime()
  };
};

const parseDefaultRSSItem = (item) => {
  return {
    id: item.guid || `rss-${Date.now()}-${Math.random()}`,
    title: item.title || 'No title',
    summary: extractTextFromCDATA(item.description) || '',
    link: item.link,
    image: item.enclosure?.url || '',
    published: item.pubDate,
    isoDate: item.pubDate,
    timestamp: new Date(item.pubDate).getTime()
  };
};

// Helper functions
const extractImageFromBBC = (item) => {
  if (item.link && item.link.media) {
    const media = item.link.media;
    if (media.thumbnail && media.thumbnail.url) {
      return media.thumbnail.url;
    } else if (media.content && media.content.thumbnail && media.content.thumbnail.url) {
      return media.content.thumbnail.url;
    }
  }
  return '';
};

const extractLinkFromBBC = (item) => {
  if (item.link) {
    if (Array.isArray(item.link)) {
      const alternateLink = item.link.find(link => link.rel === 'alternate');
      return alternateLink?.href || '';
    } else if (item.link.href) {
      return item.link.href;
    }
  }
  return '';
};

const extractImageFromAntara = (item) => {
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  
  const imageMatch = item.description?.match(/<img[^>]+src="([^">]+)"/);
  return imageMatch ? imageMatch[1] : '';
};

const extractTextFromCDATA = (text) => {
  if (!text) return '';
  // Remove CDATA tags and HTML tags
  return text.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
             .replace(/<[^>]*>/g, '')
             .trim();
};

// Fungsi untuk fetch RSS
const fetchRSSFeed = async (url, sourceType = 'default') => {
  try {
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    return await parseRSS(response.data, sourceType);
  } catch (error) {
    console.error(`Error fetching RSS from ${url}:`, error.message);
    return [];
  }
};

// Fungsi untuk fetch JSON API dengan kategori tertentu
const fetchJSONApiWithCategory = async (source, category = null) => {
  try {
    let apiUrl = source.url;
    if (category) {
      apiUrl = `${source.url}/${category}`;
    }
    
    const response = await axios.get(apiUrl, { timeout: 5000 });
    const data = response.data.data;
    
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      id: item.id || `${source.id}-${Date.now()}-${Math.random()}`,
      name: source.name,
      title: item.title,
      date: formatDate(item.isoDate),
      link: item.link,
      image: item.image ? item.image.medium || item.image.small || item.image : '',
      icon_url: source.icon_url,
      timestamp: new Date(item.isoDate).getTime(),
      source: source.id,
      category: category
    }));
  } catch (error) {
    console.error(`Error fetching from ${source.name}${category ? ` (${category})` : ''}:`, error.message);
    return [];
  }
};

// Fungsi untuk fetch semua RSS sources
const fetchAllRSSNews = async () => {
  const allArticles = [];
  const promises = [];

  for (const source of rssSources) {
    for (const category of source.categories) {
      promises.push(
        fetchRSSFeed(category.url, source.id)
          .then(articles => {
            articles.forEach(article => {
              allArticles.push({
                ...article,
                source: source.id,
                name: source.name,
                icon_url: source.icon_url,
                category: category.id
              });
            });
          })
          .catch(error => {
            console.error(`Error fetching ${source.name} (${category.name}):`, error.message);
          })
      );
    }
  }

  await Promise.allSettled(promises);
  return allArticles;
};

// Fungsi untuk fetch JSON API sources
const fetchJSONApiNews = async () => {
  const allArticles = [];
  const promises = [];

  for (const source of jsonApiSources) {
    // Fetch semua kategori
    for (const category of source.categories) {
      promises.push(
        fetchJSONApiWithCategory(source, category.id)
          .then(articles => {
            allArticles.push(...articles);
          })
          .catch(error => {
            console.error(`Error fetching ${source.name} (${category.name}):`, error.message);
          })
      );
    }
  }

  await Promise.allSettled(promises);
  return allArticles;
};

// Main function untuk fetch semua berita
const fetchFromAPIs = async () => {
  const mergedData = { merger_api: [] };
  
  const [rssArticles, jsonArticles, trendingData] = await Promise.allSettled([
    fetchAllRSSNews(),
    fetchJSONApiNews(),
    fetchTrendingFromNewsData()
  ]);

  // Gabungkan semua artikel
  if (rssArticles.status === 'fulfilled') {
    rssArticles.value.forEach(article => {
      mergedData.merger_api.push({
        id: article.id,
        name: article.name,
        title: article.title,
        date: formatDate(article.published),
        link: article.link,
        image: article.image,
        icon_url: article.icon_url,
        timestamp: article.timestamp,
        source: article.source
      });
    });
  }

  if (jsonArticles.status === 'fulfilled') {
    mergedData.merger_api.push(...jsonArticles.value);
  }

  if (trendingData.status === 'fulfilled' && trendingData.value.length > 0) {
    trendingData.value.forEach(item => {
      mergedData.merger_api.push({
        id: 'trending',
        name: item.source || 'Trending',
        title: item.title,
        date: item.date,
        link: item.url,
        image: item.thumbnail,
        icon_url: item.sourceIcon,
        timestamp: item.timestamp,
        source: 'trending'
      });
    });
  }

  // Urutkan berdasarkan timestamp
  mergedData.merger_api.sort((a, b) => b.timestamp - a.timestamp);
  return mergedData;
};

// Fetch trending data (tetap sama)
const fetchTrendingFromNewsData = async () => {
  try {
    const response = await axios.get('https://newsdata.io/api/1/latest?country=id&category=top&apikey=pub_398368974a39ae721d8da731085226a23846a', { timeout: 5000 });
    const data = response.data.results;

    if (!data || !Array.isArray(data)) return [];

    return data.map(item => {
      const pubDate = new Date(item.pubDate);
      return {
        id: item.article_id, 
        title: item.title, 
        date: formatDate(pubDate), 
        timestamp: pubDate.getTime(), 
        url: item.link, 
        thumbnail: item.image_url,
        source: item.source_name, 
        sourceIcon: item.source_icon, 
      };
    });

  } catch (error) {
    console.error('Error fetching trending data:', error.message);
    return [];
  }
};

// Fungsi untuk fetch berita dari sumber tertentu
const fetchNewsFromSource = async (sourceId, categoryId = null) => {
  const source = [...rssSources, ...jsonApiSources].find(s => s.id === sourceId);
  if (!source) return [];

  let articles = [];

  if (source.categories && source.categories[0].url) {
    // RSS source
    const categoriesToFetch = categoryId 
      ? source.categories.filter(cat => cat.id === categoryId)
      : source.categories;

    for (const category of categoriesToFetch) {
      const categoryArticles = await fetchRSSFeed(category.url, source.id);
      articles = articles.concat(categoryArticles.map(article => ({
        ...article,
        source: source.id,
        name: source.name,
        icon_url: source.icon_url,
        category: category.id
      })));
    }
  } else {
    // JSON API source
    const categoriesToFetch = categoryId 
      ? source.categories.filter(cat => cat.id === categoryId)
      : source.categories;

    for (const category of categoriesToFetch) {
      const categoryArticles = await fetchJSONApiWithCategory(source, category.id);
      articles = articles.concat(categoryArticles);
    }
  }

  return articles;
};

// Fungsi untuk mendapatkan daftar kategori dari sumber tertentu
const getSourceCategories = (sourceId) => {
  const source = [...rssSources, ...jsonApiSources].find(s => s.id === sourceId);
  if (!source || !source.categories) return [];
  
  return source.categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    url: cat.url || null
  }));
};

// Fungsi untuk mendapatkan semua kategori dari semua sumber
const getAllCategories = () => {
  const allCategories = {};
  
  [...rssSources, ...jsonApiSources].forEach(source => {
    if (source.categories) {
      source.categories.forEach(category => {
        const categoryKey = `${category.id}-${category.name}`;
        if (!allCategories[categoryKey]) {
          allCategories[categoryKey] = {
            id: category.id,
            name: category.name,
            sources: []
          };
        }
        allCategories[categoryKey].sources.push(source.id);
      });
    }
  });
  
  return Object.values(allCategories);
};

module.exports = { 
  fetchFromAPIs, 
  fetchTrendingFromNewsData, 
  fetchNewsFromSource,
  getSourceCategories,
  getAllCategories,
  rssSources,
  jsonApiSources 
};