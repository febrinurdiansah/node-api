const axios = require('axios');
const natural = require('natural');
const stopword = require('stopword');
const { KMeans } = require('ml-kmeans');
const TfIdf = natural.TfIdf;

router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

function preprocess(text) {
    let tokens = new natural.WordTokenizer().tokenize(text);
    tokens = stopword.removeStopwords(tokens);
    const stemmer = natural.PorterStemmer;
    tokens = tokens.map(token => stemmer.stem(token));
    return tokens.join(' ');
}

function extractFeatures(news) {
    const tfidf = new TfIdf();
    news.forEach(article => tfidf.addDocument(article));
    let features = [];
    news.forEach((article, index) => {
        let vector = [];
        tfidf.tfidfs(article, (i, measure) => vector[i] = measure);
        features.push(vector);
    });
    return features;
}

function clusterNews(features) {
    const k = 5;
    const kmeans = new KMeans(features, k);
    return kmeans.clusters;
}

function getTrendingNews(news, clusters) {
    let clusterMap = new Map();
    clusters.forEach((cluster, index) => {
        if (!clusterMap.has(cluster)) {
            clusterMap.set(cluster, []);
        }
        clusterMap.get(cluster).push(news[index]);
    });

    let trendingClusters = Array.from(clusterMap.values()).sort((a, b) => b.length - a.length);
    return trendingClusters[0];
}

async function processNews(newsSources) {
    const mergedData = [];

    const promises = newsSources.map(source => {
        return axios.get(source.url).then(response => {
            const data = response.data;
            const items = data.data || data.data.posts;
            items.forEach(item => {
                let imageUrl = '';
                if (item.image) {
                    if ('medium' in item.image) {
                        imageUrl = item.image.medium;
                    } else if ('small' in item.image) {
                        imageUrl = item.image.small;
                    } else {
                        imageUrl = item.image;
                    }
                }

                mergedData.push({
                    id: source.id,
                    name: source.name,
                    title: item.title,
                    date: item.isoDate || item.pubDate,
                    link: item.link,
                    image: imageUrl,
                    icon_url: source.icon_url,
                    timestamp: new Date(item.isoDate || item.pubDate).getTime(),
                });
            });
        }).catch(error => {
            console.error(`Error fetching data from ${source.name}:`, error.message);
        });
    });

    await Promise.all(promises);

    const now = Date.now();
    const last24HoursNews = mergedData.filter(article => now - article.timestamp <= 24 * 60 * 60 * 1000);

    const preprocessedNews = last24HoursNews.map(article => preprocess(article.title));
    const features = extractFeatures(preprocessedNews);

    const clusters = clusterNews(features);

    const trendingNews = getTrendingNews(last24HoursNews, clusters);

    return trendingNews;
}

module.exports = { processNews };
