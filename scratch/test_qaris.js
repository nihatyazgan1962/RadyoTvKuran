const https = require('https');

const qarisToTest = [
  { name: 'İslam Sobhi', url: 'https://server14.mp3quran.net/sobhi/001.mp3', server: 'server14', slug: 'sobhi' },
  { name: 'Hazaa Al-Balushi', url: 'https://server11.mp3quran.net/balushi/001.mp3', server: 'server11', slug: 'balushi' },
  { name: 'Mansoor Al-Salimi', url: 'https://server14.mp3quran.net/mansor/001.mp3', server: 'server14', slug: 'mansor' },
  { name: 'Raad Mohammad Al Kurdi', url: 'https://server6.mp3quran.net/kurdi/001.mp3', server: 'server6', slug: 'kurdi' },
  { name: 'İdris Ebker', url: 'https://server6.mp3quran.net/abkr/001.mp3', server: 'server6', slug: 'abkr' },
  { name: 'Hani er-Rifai', url: 'https://server8.mp3quran.net/rifai/001.mp3', server: 'server8', slug: 'rifai' },
  { name: 'Mustafa İsmail', url: 'https://server8.mp3quran.net/mustafa/001.mp3', server: 'server8', slug: 'mustafa' },
  { name: 'Ali Jaber', url: 'https://server11.mp3quran.net/a_jbr/001.mp3', server: 'server11', slug: 'a_jbr' },
  { name: 'Salih el-Budeyr', url: 'https://server6.mp3quran.net/s_bud/001.mp3', server: 'server6', slug: 's_bud' },
  { name: 'Halid el-Galil', url: 'https://server10.mp3quran.net/jleel/001.mp3', server: 'server10', slug: 'jleel' },
  { name: 'Halid el-Kahtani', url: 'https://server10.mp3quran.net/qht/001.mp3', server: 'server10', slug: 'qht' },
  { name: 'Mahir el-Muaykili', url: 'https://server12.mp3quran.net/maher/001.mp3', server: 'server12', slug: 'maher' },
  { name: 'Faris Abbad', url: 'https://server8.mp3quran.net/frs_a/001.mp3', server: 'server8', slug: 'frs_a' },
  { name: 'Ahmed el-Acemi', url: 'https://server10.mp3quran.net/ajm/001.mp3', server: 'server10', slug: 'ajm' },
];

function check(q) {
  return new Promise(resolve => {
    https.get(q.url, { timeout: 4000, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      resolve({ ...q, ok: res.statusCode === 200, status: res.statusCode });
      res.destroy();
    }).on('error', e => resolve({ ...q, ok: false, error: e.message }));
  });
}

async function run() {
  const res = await Promise.all(qarisToTest.map(check));
  console.log('Qaris test results:');
  res.forEach(r => console.log(`${r.name}: ${r.ok ? 'OK (200)' : 'FAIL (' + (r.error || r.status) + ')'} -> ${r.url}`));
}

run();
