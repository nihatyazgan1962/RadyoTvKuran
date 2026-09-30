const https = require('https');
const http = require('http');

const allItems = [
  { name: 'Moral FM', url: 'https://stream.zeno.fm/0cfiqwdkobavv' },
  { name: 'Gaziantep Davet Radyo', url: 'https://stream.radiojar.com/ggu0fd6qu2wtv.mp3' },
  { name: 'Nida Radyo', url: 'https://anadolu.liderhost.com.tr:8106/stream' },
  { name: 'Medrese Radyo (Medresetüzzehra)', url: 'https://admin.medreseradyo.com/radio/8160/radio.mp3' },
  { name: 'Medresetüzzehra Kur\'an', url: 'https://admin.medreseradyo.com/hls/quran/live.m3u8' },
  { name: 'Akit TV', url: 'https://edge1.socialsmart.tv/akittv/bant1/playlist.m3u8' }
];

function check(item) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(item.url);
      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.get(item.url, { timeout: 5000, headers: { 'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18' }, rejectUnauthorized: false }, (res) => {
        if ((res.statusCode >= 200 && res.statusCode < 400) || res.statusCode === 302) {
          resolve({ ...item, ok: true, status: res.statusCode });
        } else {
          resolve({ ...item, ok: false, status: res.statusCode });
        }
        res.destroy();
      });
      req.on('error', (e) => resolve({ ...item, ok: false, error: e.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ ...item, ok: false, error: 'TIMEOUT' });
      });
    } catch (e) {
      resolve({ ...item, ok: false, error: e.message });
    }
  });
}

async function run() {
  const results = await Promise.all(allItems.map(check));
  console.log('RESULTS:');
  results.forEach(r => console.log(`${r.name}: ${r.ok ? 'OK (' + r.status + ')' : 'FAIL (' + (r.error || r.status) + ')'} -> ${r.url}`));
}

run();
