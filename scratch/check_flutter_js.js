const https = require('https');

https.get('https://medreseradyo.com/main.dart.js', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const urls = data.match(/https?:\/\/[^"'\s<>\\]+\.(mp3|m3u8|aac|ogg)[^"'\s<>\\]*/gi) || [];
    const ports = data.match(/https?:\/\/[a-zA-Z0-9.-]+:[0-9]+\/[^"'\s<>\\]*/gi) || [];
    const zenos = data.match(/https?:\/\/[a-zA-Z0-9.-]+\.zeno\.fm\/[^"'\s<>\\]*/gi) || [];
    console.log('Found URLs in Flutter app:', [...new Set([...urls, ...ports, ...zenos])]);
  });
}).on('error', console.error);
