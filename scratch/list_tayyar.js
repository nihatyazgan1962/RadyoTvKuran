const https = require('https');

function get(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });
}

async function run() {
  const meta = await get('https://archive.org/metadata/tayyar_altikulac_sure_sure_hatim');
  const files = (meta.files || []).filter(f => f.name.endsWith('.mp3'));
  console.log('All Tayyar files:');
  console.log(files.map(f => f.name).join(', '));
}

run();
