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
  const qList = [
    'title:(Ishak Danis) AND (Sure OR Suresi OR 114)',
    'title:(Fatih Collak) AND (Sure OR Suresi OR 114)',
    'title:(Bunyamin Topcuoglu)',
    'title:(Mehmet Bilir)',
    'title:(Alpcan Celik)'
  ];

  for (const q of qList) {
    const res = await get(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier,title&rows=6&output=json`);
    console.log(`\nQuery: ${q}`);
    console.log(res.response && res.response.docs);
  }
}

run().catch(console.error);
