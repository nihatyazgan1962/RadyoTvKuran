const fs = require('fs');
const raw = fs.readFileSync('scratch/reciters_tr.json', 'utf8').replace(/^\uFEFF/, '');
const data = JSON.parse(raw);
const reciters = data.reciters || [];

console.log('Total reciters:', reciters.length);
const searchNames = ['ishak', 'fatih', 'ilhan', 'bünyamin', 'bunyamin', 'mehmet', 'ahmet', 'ismail', 'osman', 'ali', 'turk', 'türk'];

const matches = reciters.filter(r => {
  const name = (r.name || '').toLowerCase();
  return searchNames.some(s => name.includes(s));
});

matches.forEach(m => {
  console.log(`ID: ${m.id} | Name: ${m.name}`);
  if (m.moshaf && m.moshaf.length > 0) {
    m.moshaf.forEach(mos => {
      console.log(`   Moshaf: ${mos.name} | Server: ${mos.server} | surah_total: ${mos.surah_total}`);
    });
  }
});
