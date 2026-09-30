const https = require('https');

function head(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      resolve({ url, statusCode: res.statusCode, location: res.headers.location });
    }).on('error', (e) => resolve({ url, error: e.message })).end();
  });
}

async function run() {
  const urls = [
    'https://archive.org/download/fatihcollakk/001_Fatiha.mp3',
    'https://archive.org/download/LhanTokdinle/001-Fatiha%20Suresi.mp3',
    'https://archive.org/download/lifeways11_gmail_001_20180215_2321/001.mp3'
  ];

  for (const u of urls) {
    const r = await head(u);
    console.log(r);
  }
}

run();
