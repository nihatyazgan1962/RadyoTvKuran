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
  const meta = await get('https://archive.org/metadata/tayyar_altikulac_sure_sure_hatim');
  const files = (meta.files || []).filter(f => f.name.endsWith('.mp3'));
  console.log('Tayyar files count:', files.length);
  files.slice(0, 10).forEach(f => console.log(f.name));
}

run();
