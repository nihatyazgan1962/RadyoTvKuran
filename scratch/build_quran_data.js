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
  const surahData = await get('https://api.alquran.cloud/v1/surah');
  const surahs = surahData.data || [];

  const turkishNames = [
    "Fâtiha Suresi", "Bakara Suresi", "Âl-i İmrân Suresi", "Nisâ Suresi", "Mâide Suresi", "En'âm Suresi", "A'râf Suresi", "Enfâl Suresi", "Tevbe Suresi", "Yûnus Suresi",
    "Hûd Suresi", "Yûsuf Suresi", "Ra'd Suresi", "İbrâhîm Suresi", "Hicr Suresi", "Nahl Suresi", "İsrâ Suresi", "Kehf Suresi", "Meryem Suresi", "Tâhâ Suresi",
    "Enbiyâ Suresi", "Hac Suresi", "Mü'minûn Suresi", "Nûr Suresi", "Furkan Suresi", "Şuarâ Suresi", "Neml Suresi", "Kasas Suresi", "Ankebût Suresi", "Rûm Suresi",
    "Lokmân Suresi", "Secde Suresi", "Ahzâb Suresi", "Sebe' Suresi", "Fâtır Suresi", "Yâsîn Suresi", "Sâffât Suresi", "Sâd Suresi", "Zümer Suresi", "Mü'min (Gâfir) Suresi",
    "Fussilet Suresi", "Şûrâ Suresi", "Zuhruf Suresi", "Duhân Suresi", "Câsiye Suresi", "Ahkâf Suresi", "Muhammed Suresi", "Fetih Suresi", "Hucurât Suresi", "Kâf Suresi",
    "Zâriyât Suresi", "Tûr Suresi", "Necm Suresi", "Kamer Suresi", "Rahmân Suresi", "Vâkıa Suresi", "Hadîd Suresi", "Mücâdele Suresi", "Haşr Suresi", "Mümtehine Suresi",
    "Saf Suresi", "Cuma Suresi", "Münâfikûn Suresi", "Teğâbün Suresi", "Talâk Suresi", "Tahrîm Suresi", "Mülk (Tebâreke) Suresi", "Kalem Suresi", "Hâkka Suresi", "Meâric Suresi",
    "Nûh Suresi", "Cin Suresi", "Müzzemmil Suresi", "Müddessir Suresi", "Kıyâmet Suresi", "İnsân Suresi", "Mürselât Suresi", "Nebe (Amme) Suresi", "Nâziât Suresi", "Abese Suresi",
    "Tekvîr Suresi", "İnfitâr Suresi", "Mutaffifîn Suresi", "İnşikâk Suresi", "Bürûc Suresi", "Târık Suresi", "A'lâ Suresi", "Gâşiye Suresi", "Fecr Suresi", "Beled Suresi",
    "Şems Suresi", "Leyl Suresi", "Duhâ Suresi", "İnşirâh Suresi", "Tîn Suresi", "Alak Suresi", "Kadir Suresi", "Beyyine Suresi", "Zilzâl Suresi", "Âdiyât Suresi",
    "Kâria Suresi", "Tekâsür Suresi", "Asr Suresi", "Hümeze Suresi", "Fîl Suresi", "Kureyş Suresi", "Mâûn Suresi", "Kevser Suresi", "Kâfirûn Suresi", "Nasr Suresi",
    "Tebbet Suresi", "İhlâs Suresi", "Felak Suresi", "Nâs Suresi"
  ];

  const fullSurahList = surahs.map((s, idx) => ({
    number: String(s.number),
    code: String(s.number).padStart(3, '0'),
    name: turkishNames[idx] || s.englishName,
    arabicName: s.name,
    ayahCount: s.numberOfAyahs,
  }));

  const maps = JSON.parse(fs.readFileSync('scratch/maps.json', 'utf8'));

  const tayyarSpecial = {
    "003": "Ali Imran.mp3",
    "009": "Tevbbe.mp3",
    "014": "Ibrahim.mp3",
    "017": "Isra.mp3",
    "035": "Fatir.mp3",
    "040": "Mumin.mp3",
    "056": "Vakia.mp3",
    "061": "Saf.mp3",
    "063": "Munafikun.mp3",
    "064": "Tegabun.mp3",
    "067": "Mulk.mp3",
    "075": "Kiyamet.mp3",
    "076": "Insan.mp3",
    "078": "Nebe.mp3",
    "082": "Infitar.mp3",
    "084": "Insikak.mp3",
    "086": "Tarik.mp3",
    "088": "Gasiye.mp3",
    "094": "Insirah.mp3",
    "112": "Ihlas.mp3",
  };

  const tayyarMeta = await get('https://archive.org/metadata/tayyar_altikulac_sure_sure_hatim');
  const tayyarFiles = (tayyarMeta.files || []).filter(f => f.name.endsWith('.mp3'));
  
  const tayyarMap = {};
  for (const s of fullSurahList) {
    if (tayyarSpecial[s.code]) {
      tayyarMap[s.code] = tayyarSpecial[s.code];
      continue;
    }
    const cleanName = s.name.replace(' Suresi', '').toLowerCase()
      .replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ö/g, 'o').replace(/ü/g, 'u')
      .replace(/['’]/g, '').trim();
    
    const found = tayyarFiles.find(f => {
      const fClean = f.name.replace('.mp3', '').toLowerCase()
        .replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ö/g, 'o').replace(/ü/g, 'u')
        .replace(/['’]/g, '').trim();
      return fClean === cleanName || fClean.startsWith(cleanName) || cleanName.startsWith(fClean);
    });
    if (found) {
      tayyarMap[s.code] = found.name;
    }
  }

  console.log('Surahs count:', fullSurahList.length);
  console.log('Tayyar mapped count:', Object.keys(tayyarMap).length);

  const fileContent = `export interface Surah {
  number: string;
  code: string;
  name: string;
  arabicName: string;
  ayahCount: number;
}

export interface Qari {
  id: string;
  name: string;
  title: string;
  country: 'TR' | 'WORLD';
  type: 'mp3quran' | 'archive_ishak' | 'archive_fatih' | 'archive_ilhan' | 'archive_tayyar';
  server?: string;
  slug?: string;
}

export const qarisList: Qari[] = [
  // Meşhur Türk Karileri
  { id: 'tr_1', name: 'Hafız İshak Danış', title: 'İstanbul Kasımpaşa Büyük Camii Baş İmamı (Hatim)', country: 'TR', type: 'archive_ishak' },
  { id: 'tr_2', name: 'Prof. Dr. Fatih Çollak', title: 'Marmara İlahiyat Kıraat Üstadı (Hatim)', country: 'TR', type: 'archive_fatih' },
  { id: 'tr_3', name: 'Hafız İlhan Tok', title: 'Diyanet & TRT Radyoları Baş Karisi (Hatim)', country: 'TR', type: 'archive_ilhan' },
  { id: 'tr_4', name: 'Dr. Tayyar Altıkulaç', title: 'Eski Diyanet İşleri Başkanı & Kıraat Alimi (Hatim)', country: 'TR', type: 'archive_tayyar' },

  // Meşhur Dünya Karileri
  { id: '1', name: 'Abdurrahman es-Sudeysi', title: 'Kâbe İmamı (Mescid-i Haram)', country: 'WORLD', type: 'mp3quran', server: 'server11', slug: 'sds' },
  { id: '2', name: 'Mishary Rashid Alafasy', title: 'Kuveyt (Rivayet Hafs)', country: 'WORLD', type: 'mp3quran', server: 'server8', slug: 'afs' },
  { id: '3', name: 'Abdulbasit Abdussamed', title: 'Mısır (Murattal)', country: 'WORLD', type: 'mp3quran', server: 'server7', slug: 'basit' },
  { id: '4', name: 'Maher Al-Muaiqly', title: 'Kâbe İmamı (Mescid-i Haram)', country: 'WORLD', type: 'mp3quran', server: 'server12', slug: 'maher' },
  { id: '5', name: 'Saad Al-Ghamdi', title: 'Suudi Arabistan', country: 'WORLD', type: 'mp3quran', server: 'server7', slug: 's_gmd' },
  { id: '6', name: 'Yasser Al-Dosari', title: 'Kâbe İmamı (Mescid-i Haram)', country: 'WORLD', type: 'mp3quran', server: 'server11', slug: 'yasser' },
  { id: '7', name: 'Muhammed Sıddık el-Minşevi', title: 'Mısır (Murattal)', country: 'WORLD', type: 'mp3quran', server: 'server10', slug: 'minsh' },
  { id: '8', name: 'Mahmud Halil el-Husari', title: 'Mısır (Murattal)', country: 'WORLD', type: 'mp3quran', server: 'server13', slug: 'husr' },
  { id: '9', name: 'Ebubekir eş-Şâtırî', title: 'Suudi Arabistan', country: 'WORLD', type: 'mp3quran', server: 'server11', slug: 'shatri' },
  { id: '10', name: 'Nâsır el-Katâmî', title: 'Riyad', country: 'WORLD', type: 'mp3quran', server: 'server6', slug: 'qtm' },
];

export const fatihFilesMap: Record<string, string> = ${JSON.stringify(maps.fatihMap, null, 2)};

export const ilhanFilesMap: Record<string, string> = ${JSON.stringify(maps.ilhanMap, null, 2)};

export const tayyarFilesMap: Record<string, string> = ${JSON.stringify(tayyarMap, null, 2)};

export const surahsList: Surah[] = ${JSON.stringify(fullSurahList, null, 2)};

export function getSurahAudioUrl(qari: Qari, surah: Surah): string {
  switch (qari.type) {
    case 'archive_ishak':
      return \`https://archive.org/download/lifeways11_gmail_001_20180215_2321/\${surah.code}.mp3\`;
    case 'archive_fatih': {
      const fileName = fatihFilesMap[surah.code] || \`\${surah.code}.mp3\`;
      return \`https://archive.org/download/fatihcollakk/\${encodeURIComponent(fileName)}\`;
    }
    case 'archive_ilhan': {
      const fileName = ilhanFilesMap[surah.code] || \`\${surah.code}.mp3\`;
      return \`https://archive.org/download/LhanTokdinle/\${encodeURIComponent(fileName)}\`;
    }
    case 'archive_tayyar': {
      const fileName = tayyarFilesMap[surah.code] || \`\${surah.code}.mp3\`;
      return \`https://archive.org/download/tayyar_altikulac_sure_sure_hatim/\${encodeURIComponent(fileName)}\`;
    }
    case 'mp3quran':
    default:
      return \`https://\${qari.server || 'server8'}.mp3quran.net/\${qari.slug || 'afs'}/\${surah.code}.mp3\`;
  }
}
`;

  fs.writeFileSync('constants/quranData.ts', fileContent, 'utf8');
  console.log('constants/quranData.ts updated with full 114 maps!');
}

run().catch(console.error);
