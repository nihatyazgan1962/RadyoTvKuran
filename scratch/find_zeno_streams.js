const https = require('https');

function getHtml(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function findStreams() {
  const pages = [
    'https://onlineradiobox.com/tr/davetradyo/',
    'https://zeno.fm/radio/davet-radyo/',
    'https://zeno.fm/radio/nida-radyo/',
    'https://zeno.fm/radio/moral-fm/',
    'https://zeno.fm/radio/medresetuzzehra/',
    'https://onlineradiobox.com/tr/nidaradyo/',
    'https://onlineradiobox.com/tr/moralfm/'
  ];

  for (const p of pages) {
    const html = await getHtml(p);
    const matches = html.match(/https?:\/\/[^"'\s]+\.(mp3|m3u8|aac|ogg)[^"'\s]*/gi) || [];
    const zenoMatches = html.match(/https?:\/\/stream\.zeno\.fm\/[^"'\s]+/gi) || [];
    console.log(`=== Page: ${p} ===`);
    console.log('Stream matches:', [...new Set([...matches, ...zenoMatches])]);
  }
}

findStreams();
