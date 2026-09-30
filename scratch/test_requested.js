const https = require('https');
const http = require('http');

const candidateItems = [
  // Radios
  { name: 'Moral FM 1', url: 'https://yayin.moralfm.com.tr/stream' },
  { name: 'Moral FM 2', url: 'http://yayin.canliradyolive.com:8050/;' },
  { name: 'Moral FM 3', url: 'http://stream.moralfm.com.tr:8000/stream' },
  { name: 'Moral FM 4', url: 'http://stream.moralfm.com.tr:8080/;' },
  { name: 'Moral FM 5', url: 'https://stream.moralfm.com.tr/live.mp3' },
  { name: 'Moral FM 6', url: 'http://37.148.212.8:8050/;' },
  { name: 'Moral FM 7', url: 'http://yayin.radyomoral.com:8050/;' },
  { name: 'Moral FM 8', url: 'http://yayin.moralfm.com:8050/;' },
  { name: 'Moral FM 9', url: 'https://ssl.canliyayin.org:8052/;' },

  { name: 'Davet Radyo 1', url: 'http://yayin.davetradyo.com:8020/;' },
  { name: 'Davet Radyo 2', url: 'http://yayin1.canliyayin.org:8020/;' },
  { name: 'Davet Radyo 3', url: 'http://yayin2.canliyayin.org:8020/;' },
  { name: 'Davet Radyo 4', url: 'http://davetradyo.canliyayinda.com:8020/;' },
  { name: 'Davet Radyo 5', url: 'http://stream.davetradyo.com:8000/;' },
  { name: 'Davet Radyo 6', url: 'http://yayin.davetradyo.com:9300/;' },

  { name: 'Nida Radyo 1', url: 'http://yayin.nidaradyo.com:8020/;' },
  { name: 'Nida Radyo 2', url: 'http://yayin.nidaradyo.com:8000/;' },
  { name: 'Nida Radyo 3', url: 'http://yayin1.canliyayin.org:8840/;' },
  { name: 'Nida Radyo 4', url: 'http://yayin.canliradyolive.com:8840/;' },
  { name: 'Nida Radyo 5', url: 'http://nidaradyo.canliyayinda.com:8020/;' },

  { name: 'Medresetüzzehra Radyo 1', url: 'http://yayin.medresetuzzehra.com:8000/;' },
  { name: 'Medresetüzzehra Radyo 2', url: 'http://stream.medresetuzzehra.com:8000/;' },
  { name: 'Medresetüzzehra Radyo 3', url: 'http://yayin.medresetuzzehra.org:8000/;' },
  { name: 'Medresetüzzehra Radyo 4', url: 'http://yayin1.canliyayin.org:8000/medresetuzzehra' },
  { name: 'Medresetüzzehra Radyo 5', url: 'https://yayin.risaleinur.org.tr:8000/;' },
  { name: 'Medresetüzzehra Radyo 6', url: 'http://yayin.nurnet.org:8000/;' },

  // Akit TV
  { name: 'Akit TV 1', url: 'https://live.akittv.com.tr/hls/stream.m3u8' },
  { name: 'Akit TV 2', url: 'https://b01c02nl.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_akittv.smil/playlist.m3u8' },
  { name: 'Akit TV 3', url: 'https://stream.akittv.com.tr/live/akittv.m3u8' },
  { name: 'Akit TV 4', url: 'https://akittv-live.lg.mncdn.com/akittv/akittv/playlist.m3u8' },
  { name: 'Akit TV 5', url: 'https://edge1.socialsmart.tv/akittv/bant1/playlist.m3u8' },
  { name: 'Akit TV 6', url: 'https://mn-nl.mncdn.com/akittv/akittv.smil/playlist.m3u8' },
  { name: 'Akit TV 7', url: 'https://tv.akittv.com.tr/live/stream.m3u8' }
];

function checkUrl(item) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(item.url);
      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.get(item.url, { timeout: 4500, headers: { 'User-Agent': 'Mozilla/5.0' }, rejectUnauthorized: false }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
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
    } catch (err) {
      resolve({ ...item, ok: false, error: err.message });
    }
  });
}

async function run() {
  console.log('Testing requested streams...');
  const results = await Promise.all(candidateItems.map(checkUrl));
  const working = results.filter(r => r.ok);
  const failed = results.filter(r => !r.ok);
  
  console.log(`\n--- WORKING (${working.length}) ---`);
  working.forEach(w => console.log(`${w.name} -> ${w.url}`));

  console.log(`\n--- FAILED (${failed.length}) ---`);
  failed.forEach(f => console.log(`${f.name} - Reason: ${f.error || f.status}`));
}

run();
