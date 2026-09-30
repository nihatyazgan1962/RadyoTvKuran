const https = require('https');
const fs = require('fs');

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
  console.log('Tayyar files:', files.length);
  files.forEach(f => console.log(f.name, f.title || ''));
}

run();
