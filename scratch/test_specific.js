const https = require('https');
const http = require('http');

const items = [
  { name: 'Moral FM (Zeno)', url: 'https://stream.zeno.fm/0cfiqwdkobavv' },
  { name: 'Davet Radyo Gaziantep (Radiojar)', url: 'https://stream.radiojar.com/ggu0fd6qu2wtv.mp3' },
  { name: 'Davet Radyo 2', url: 'https://stream.zeno.fm/4m2ywn4gze0uv' },
  { name: 'Akit TV', url: 'https://edge1.socialsmart.tv/akittv/bant1/playlist.m3u8' },
  
  // Nida Radyo candidates
  { name: 'Nida Radyo (Zeno 1)', url: 'https://stream.zeno.fm/v6v9p4gze0uv' },
  { name: 'Nida Radyo (Zeno 2)', url: 'https://stream.zeno.fm/w0g6a29480hvv' },
  { name: 'Nida Radyo (Bursa)', url: 'http://yayin.radyonida.com:8020/;' },
  { name: 'Nida Radyo (Net)', url: 'https://nidaradyo.com/stream' },
  { name: 'Radyo Nida', url: 'http://stream.radyonida.com:8000/;' },
  { name: 'Nida FM', url: 'http://88.255.80.206:8020/;' },

  // Medresetüzzehra & Risale candidates
  { name: 'Medresetüzzehra Radyo (Zeno 1)', url: 'https://stream.zeno.fm/99m04h6z5rhvv' },
  { name: 'Medresetüzzehra Radyo (Zeno 2)', url: 'https://stream.zeno.fm/75h4g6v8srhvv' },
  { name: 'Medresetüzzehra Radyo (Zeno 3)', url: 'https://stream.zeno.fm/u3k5sz47p0hvv' },
  { name: 'Risale Radyo', url: 'http://yayin.risaleradyo.com:8000/;' },
  { name: 'Ders Radyo (Risale)', url: 'http://stream.risalei-nur.org:8000/;' },
  { name: 'Medrese FM', url: 'http://yayin.medresefm.com:8000/;' }
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
  const results = await Promise.all(items.map(checkUrl));
  const working = results.filter(r => r.ok);
  const failed = results.filter(r => !r.ok);
  console.log('--- WORKING ---');
  working.forEach(w => console.log(`${w.name} -> ${w.url}`));
  console.log('\n--- FAILED ---');
  failed.forEach(f => console.log(`${f.name}: ${f.error || f.status}`));
}

run();
