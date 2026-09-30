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
  const fatih = await get('https://archive.org/metadata/fatihcollakk');
  const fatihFiles = (fatih.files || []).filter(f => f.name.endsWith('.mp3')).map(f => f.name);
  fs.writeFileSync('scratch/fatih_files.json', JSON.stringify(fatihFiles, null, 2));

  const ilhan = await get('https://archive.org/metadata/LhanTokdinle');
  const ilhanFiles = (ilhan.files || []).filter(f => f.name.endsWith('.mp3')).map(f => f.name);
  fs.writeFileSync('scratch/ilhan_files.json', JSON.stringify(ilhanFiles, null, 2));

  console.log('Fatih files count:', fatihFiles.length);
  console.log('Ilhan files count:', ilhanFiles.length);
}

run().catch(console.error);
