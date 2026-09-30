const fs = require('fs');

const fatihFiles = JSON.parse(fs.readFileSync('scratch/fatih_files.json', 'utf8'));
const ilhanFiles = JSON.parse(fs.readFileSync('scratch/ilhan_files.json', 'utf8'));

const fatihMap = {};
for (const f of fatihFiles) {
  const match = f.match(/^(\d{3})/);
  if (match) {
    fatihMap[match[1]] = f;
  }
}

const ilhanMap = {};
for (const f of ilhanFiles) {
  const match = f.match(/^(\d{3})/);
  if (match) {
    ilhanMap[match[1]] = f;
  }
}

console.log('Fatih map keys count:', Object.keys(fatihMap).length);
console.log('Ilhan map keys count:', Object.keys(ilhanMap).length);

fs.writeFileSync('scratch/maps.json', JSON.stringify({ fatihMap, ilhanMap }, null, 2));
