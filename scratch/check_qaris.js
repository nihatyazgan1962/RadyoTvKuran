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
  const metadata = await get('https://archive.org/metadata/ishakdanishatim');
  const files = (metadata.files || []).filter(f => f.name.endsWith('.mp3'));
  console.log('Total mp3 files for Ishak Danis:', files.length);
  files.slice(0, 10).forEach(f => console.log(f.name));

  // Let's check Fatih Collak as well
  const searchCollak = await get('https://archive.org/advancedsearch.php?q=title%3A(Fatih+Collak)+AND+mediatype%3Aaudio&fl[]=identifier,title&rows=5&output=json');
  console.log('\nFatih Collak items:');
  console.log(searchCollak.response && searchCollak.response.docs);

  // Let's check Bunyamin Topcuoglu
  const searchBunyamin = await get('https://archive.org/advancedsearch.php?q=title%3A(Bunyamin+Topcuoglu)+AND+mediatype%3Aaudio&fl[]=identifier,title&rows=5&output=json');
  console.log('\nBunyamin Topcuoglu items:');
  console.log(searchBunyamin.response && searchBunyamin.response.docs);

  // Let's check Ismail Bicer
  const searchBicer = await get('https://archive.org/advancedsearch.php?q=title%3A(Ismail+Bicer)+AND+mediatype%3Aaudio&fl[]=identifier,title&rows=5&output=json');
  console.log('\nIsmail Bicer items:');
  console.log(searchBicer.response && searchBicer.response.docs);

  // Let's check Ilhan Tok
  const searchTok = await get('https://archive.org/advancedsearch.php?q=title%3A(Ilhan+Tok)+AND+mediatype%3Aaudio&fl[]=identifier,title&rows=5&output=json');
  console.log('\nIlhan Tok items:');
  console.log(searchTok.response && searchTok.response.docs);
}

run().catch(console.error);
