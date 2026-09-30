const https = require('https');

function testZenoStream(streamKey) {
  const url = `https://stream.zeno.fm/${streamKey}`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'VLC/3.0.18 LibVLC/3.0.18' } }, (res) => {
      console.log(`Key ${streamKey}: status ${res.statusCode}, location ${res.headers.location}`);
      resolve({ key: streamKey, status: res.statusCode, location: res.headers.location });
      res.destroy();
    }).on('error', (e) => resolve({ key: streamKey, error: e.message }));
  });
}

async function run() {
  await testZenoStream('0cfiqwdkobavv'); // moral fm
  await testZenoStream('ggu0fd6qu2wtv');
}

run();
