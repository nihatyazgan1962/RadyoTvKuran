const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const ids = ['fatihcollakk', 'lifeways11_gmail_001_20180215_2321'];
  for (const id of ids) {
    const meta = await get(`https://archive.org/metadata/${id}`);
    const files = (meta.files || []).filter(f => f.name.endsWith('.mp3'));
    console.log(`\n=== ID: ${id} (total mp3s: ${files.length}) ===`);
    files.slice(0, 15).forEach(f => console.log(f.name));
  }
}

run().catch(console.error);
