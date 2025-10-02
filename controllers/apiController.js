const axios = require('axios');
const xml2js = require('xml2js');

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
  }
];

// Konfigurasi semua sumber RSS
const rssSources = [
  // BBC Indonesia - berbagai kategori
  {
    id: 'bbc',
    name: 'BBC Indonesia',
    icon_url: 'https://images.icon-icons.com/70/PNG/512/bbc_news_14062.png',
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
    name: 'ANTARA',
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
    name: 'SINDO',
    icon_url: 'https://play-lh.googleusercontent.com/LSgpGO8zgGhnCxTTqJt-LDkOLN97Qc4JPsOZUbnnOjaMY9bP1M3_a3jmW9yt8M00EcM',
    categories: [
      { id: 'terkini', name: 'Berita Terkini', url: 'https://www.sindonews.com/feed' }
    ]
  },

  // VIVA News
  {
    id: 'viva',
    name: 'VIVA News',
    icon_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwuWnbQVFpdl3VMhacyBnVHOXJ-aLAzXeeLg&s',
    categories: [
      { id: 'terkini', name: 'Berita Terkini', url: 'https://www.viva.co.id/get/all' }
    ]
  },

  // JPNN
  {
    id: 'jpnn',
    name: 'JPNN',
    icon_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAjJYgAholK5N2RTibLYgMn4hSUeiURW5jdQ&s',
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
    icon_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4dWPdTCLYbBHwT8_QuvTRj6kw292z11Vz0A&s',
    categories: [
      { id: 'terkini', name: 'Berita Terkini', url: 'https://waspada.co.id/feed' }
    ]
  },

  // Online24jam
  {
    id: 'online24jam',
    name: 'Online24jam',
    icon_url: 'https://online24jam.com/wp-content/uploads/2024/01/cropped-site-logos.png',
    categories: [
      { id: 'terkini', name: 'Berita Terkini', url: 'https://online24jam.com/feed' }
    ]
  },

  // Media Indonesia
  {
    id: 'mediaindonesia',
    name: 'Media Indonesia',
    icon_url: 'https://media.licdn.com/dms/image/v2/C510BAQF9EkKZjSUjVg/company-logo_200_200/company-logo_200_200/0/1631316131244?e=2147483647&v=beta&t=hYTg9Ma9GomMkpgIzRLmIOB8UXuLd9BvFkA10Og7APg',
    categories: [
      { id: 'terkini', name: 'Berita Terkini', url: 'https://mediaindonesia.com/feed/all' }
    ]
  },

  // KASKUS (forum)
  {
    id: 'kaskus',
    name: 'KASKUS',
    icon_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEycYfK2vfOUQydhfgV_t75myOOLa2CcSwSA&s',
    categories: [
      { id: 'lounge', name: 'Lounge', url: 'http://www.kaskus.co.id/rss/forum/21' },
      { id: 'berita_politik', name: 'Berita & Politik', url: 'http://www.kaskus.co.id/rss/forum/10' },
      { id: 'games', name: 'Games', url: 'http://www.kaskus.co.id/rss/forum/44' }
    ]
  }
];

const formatDate = (date) => {
  const now = new Date();
  const dateData = new Date(date);
  const differenceSecond = Math.floor((now - dateData) / 1000);

  if (differenceSecond < 60) return 'Baru saja';
  if (differenceSecond < 3600) return `${Math.floor(differenceSecond / 60)} menit yang lalu`;
  if (differenceSecond < 86400) return `${Math.floor(differenceSecond / 3600)} jam yang lalu`;
  return `${Math.floor(differenceSecond / (3600 * 24))} hari yang lalu`;
};

// Helper functions
const extractTextFromCDATA = (text) => {
  if (!text) return '';
  // Remove CDATA tags and HTML tags
  return text.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
             .replace(/<[^>]*>/g, '')
             .trim();
};

const extractImageFromDescription = (description) => {
  if (!description) return '';
  const imageMatch = description.match(/<img[^>]+src="([^">]+)"/);
  return imageMatch ? imageMatch[1] : '';
};

// Parser untuk berbagai format RSS
const parseRSS = async (xmlData, sourceType = 'default') => {
  try {
    const parser = new xml2js.Parser({ 
      explicitArray: false, 
      mergeAttrs: true,
      ignoreAttrs: false
    });
    const result = await parser.parseStringPromise(xmlData);
    
    let items = [];
    
    switch (sourceType) {
      case 'bbc':
        items = result.feed?.entry || [];
        return items.map(parseBBCItem);
        
      case 'antara':
        items = result.rss?.channel?.item || [];
        return Array.isArray(items) ? items.map(parseAntaraItem) : [parseAntaraItem(items)];
        
      case 'sindonews':
        items = result.rss?.channel?.item || [];
        return Array.isArray(items) ? items.map(parseSindoItem) : [parseSindoItem(items)];
        
      case 'viva':
        items = result.rss?.channel?.item || [];
        return Array.isArray(items) ? items.map(parseVivaItem) : [parseVivaItem(items)];
        
      case 'jpnn':
        items = result.rss?.channel?.item || [];
        return Array.isArray(items) ? items.map(parseJpnnItem) : [parseJpnnItem(items)];
        
      case 'wordpress': // Untuk FAJAR, WASPADA, Online24jam
        items = result.rss?.channel?.item || [];
        return Array.isArray(items) ? items.map(parseWordpressItem) : [parseWordpressItem(items)];
        
      case 'mediaindonesia':
        items = result.rss?.channel?.item || [];
        return Array.isArray(items) ? items.map(parseMediaIndonesiaItem) : [parseMediaIndonesiaItem(items)];
        
      case 'kaskus':
        items = result.rss?.channel?.item || [];
        return Array.isArray(items) ? items.map(parseKaskusItem) : [parseKaskusItem(items)];
        
      default:
        items = result.rss?.channel?.item || [];
        return Array.isArray(items) ? items.map(parseDefaultRSSItem) : [parseDefaultRSSItem(items)];
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
  let imageUrl = '';
  
  // Method 1: Dari enclosure
  if (item.enclosure && (item.enclosure.url || item.enclosure.$?.url)) {
    imageUrl = item.enclosure.url || item.enclosure.$?.url;
  }
  
  // Method 2: Dari description
  if (!imageUrl && item.description) {
    imageUrl = extractImageFromDescription(item.description);
  }
  
  return {
    id: item.guid?.$?._ || item.guid || `antara-${Date.now()}-${Math.random()}`,
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
  let imageUrl = '';
  
  // Method 1: Dari media:content (yang paling akurat untuk SindoNews)
  if (item['media:content']) {
    if (item['media:content'].url) {
      imageUrl = item['media:content'].url;
    } else if (item['media:content'].$?.url) {
      imageUrl = item['media:content'].$?.url;
    }
  }
  
  // Method 2: Dari enclosure sebagai fallback
  if (!imageUrl && item.enclosure) {
    if (item.enclosure.url) {
      imageUrl = item.enclosure.url;
    } else if (item.enclosure.$?.url) {
      imageUrl = item.enclosure.$?.url;
    }
  }
  
  // Method 3: Parse dari description sebagai fallback terakhir
  if (!imageUrl && item.description) {
    imageUrl = extractImageFromDescription(item.description);
  }
  
  return {
    id: item.idnews || item.guid || `sindo-${Date.now()}-${Math.random()}`,
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
  let imageUrl = '';
  
  // Method 1: Dari description
  if (item.description) {
    imageUrl = extractImageFromDescription(item.description);
  }
  
  // Method 2: Dari enclosure
  if (!imageUrl && item.enclosure && item.enclosure.url) {
    imageUrl = item.enclosure.url;
  }
  
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
  let imageUrl = '';
  
  // Method 1: Dari description
  if (item.description) {
    imageUrl = extractImageFromDescription(item.description);
  }
  
  // Method 2: Dari enclosure
  if (!imageUrl && item.enclosure && item.enclosure.url) {
    imageUrl = item.enclosure.url;
  }
  
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
  let imageUrl = '';
  
  // Method 1: Dari description
  if (item.description) {
    imageUrl = extractImageFromDescription(item.description);
  }
  
  // Method 2: Dari enclosure
  if (!imageUrl && item.enclosure && item.enclosure.url) {
    imageUrl = item.enclosure.url;
  }
  
  return {
    id: item.guid || `wp-${Date.now()}-${Math.random()}`,
    title: item.title || 'No title',
    summary: extractTextFromCDATA(item.description) || '',
    link: item.link,
    image: imageUrl,
    published: item.pubDate,
    isoDate: item.pubDate,
    timestamp: new Date(item.pubDate).getTime()
  };
};

const parseMediaIndonesiaItem = (item) => {
  let imageUrl = '';
  
  // Method 1: Dari description
  if (item.description) {
    imageUrl = extractImageFromDescription(item.description);
  }
  
  // Method 2: Dari enclosure
  if (!imageUrl && item.enclosure && item.enclosure.url) {
    imageUrl = item.enclosure.url;
  }
  
  return {
    id: item.guid || `mediaindonesia-${Date.now()}-${Math.random()}`,
    title: extractTextFromCDATA(item.title) || 'No title',
    summary: extractTextFromCDATA(item.description) || '',
    link: item.link,
    image: imageUrl,
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
  let imageUrl = '';
  
  // Method 1: Dari enclosure
  if (item.enclosure && item.enclosure.url) {
    imageUrl = item.enclosure.url;
  }
  
  // Method 2: Dari description
  if (!imageUrl && item.description) {
    imageUrl = extractImageFromDescription(item.description);
  }
  
  return {
    id: item.guid || `rss-${Date.now()}-${Math.random()}`,
    title: item.title || 'No title',
    summary: extractTextFromCDATA(item.description) || '',
    link: item.link,
    image: imageUrl,
    published: item.pubDate,
    isoDate: item.pubDate,
    timestamp: new Date(item.pubDate).getTime()
  };
};

const extractImageFromBBC = (item) => {
  if (item.link && item.link['media:content'] && item.link['media:content']['media:thumbnail']) {
    const thumbnails = item.link['media:content']['media:thumbnail'];
    
    if (Array.isArray(thumbnails)) {
      const largestThumbnail = thumbnails.reduce((largest, current) => {
        const currentWidth = parseInt(current.width || current.$.width || 0);
        const largestWidth = parseInt(largest.width || largest.$.width || 0);
        return currentWidth > largestWidth ? current : largest;
      });
      
      return largestThumbnail.url || largestThumbnail.$.url || '';
    } else {
      return thumbnails.url || thumbnails.$.url || '';
    }
  }
  
  if (item.link) {
    let linkToCheck = item.link;
    if (Array.isArray(item.link)) {
      linkToCheck = item.link.find(link => 
        link['media:content'] && link['media:content']['media:thumbnail']
      );
      
      if (linkToCheck && linkToCheck['media:content'] && linkToCheck['media:content']['media:thumbnail']) {
        const thumbnails = linkToCheck['media:content']['media:thumbnail'];
        
        if (Array.isArray(thumbnails)) {
          const largestThumbnail = thumbnails.reduce((largest, current) => {
            const currentWidth = parseInt(current.width || current.$.width || 0);
            const largestWidth = parseInt(largest.width || largest.$.width || 0);
            return currentWidth > largestWidth ? current : largest;
          });
          return largestThumbnail.url || largestThumbnail.$.url || '';
        } else {
          return thumbnails.url || thumbnails.$.url || '';
        }
      }
    }
  }
  
  if (item['media:content'] && item['media:content']['media:thumbnail']) {
    const thumbnails = item['media:content']['media:thumbnail'];
    
    if (Array.isArray(thumbnails)) {
      const largestThumbnail = thumbnails.reduce((largest, current) => {
        const currentWidth = parseInt(current.width || current.$.width || 0);
        const largestWidth = parseInt(largest.width || largest.$.width || 0);
        return currentWidth > largestWidth ? current : largest;
      });
      return largestThumbnail.url || largestThumbnail.$.url || '';
    } else {
      return thumbnails.url || thumbnails.$.url || '';
    }
  }
  
  if (item.summary) {
    const summaryText = item.summary?._ || item.summary;
    const imageMatch = summaryText.match(/<img[^>]+src="([^">]+)"/);
    if (imageMatch) {
      return imageMatch[1];
    }
  }
  
  return '';
};

const extractLinkFromBBC = (item) => {
  if (item.link) {
    if (Array.isArray(item.link)) {
      // Cari link dengan rel="alternate" dan type="text/html"
      const alternateLink = item.link.find(link => 
        link.rel === 'alternate' && 
        (link.type === 'text/html' || !link.type)
      );
      return alternateLink?.href || item.link[0]?.href || '';
    } else if (item.link.href) {
      return item.link.href;
    } else if (typeof item.link === 'string') {
      return item.link;
    }
  }
  return '';
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
                category: category.id,
                date: formatDate(article.published) // Pastikan format date konsisten
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

  // Gabungkan semua artikel RSS
  if (rssArticles.status === 'fulfilled') {
    rssArticles.value.forEach(article => {
      mergedData.merger_api.push({
        id: article.id,
        name: article.name,
        title: article.title,
        date: article.date, // Sudah diformat di fetchAllRSSNews
        link: article.link,
        image: article.image || '', // Pastikan tidak null
        icon_url: article.icon_url,
        timestamp: article.timestamp,
        source: article.source
      });
    });
  }

  // Gabungkan artikel JSON API
  if (jsonArticles.status === 'fulfilled') {
    mergedData.merger_api.push(...jsonArticles.value);
  }

  // Gabungkan trending data
  if (trendingData.status === 'fulfilled' && trendingData.value.length > 0) {
    trendingData.value.forEach(item => {
      mergedData.merger_api.push({
        id: 'trending',
        name: item.source || 'Trending',
        title: item.title,
        date: item.date,
        link: item.url,
        image: item.thumbnail || '',
        icon_url: item.sourceIcon || '',
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
        thumbnail: item.image_url || '',
        source: item.source_name, 
        sourceIcon: item.source_icon || '', 
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
        category: category.id,
        date: formatDate(article.published)
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