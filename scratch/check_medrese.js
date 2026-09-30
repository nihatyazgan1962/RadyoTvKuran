const https = require('https');

https.get('https://medreseradyo.com/', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const urls = data.match(/https?:\/\/[^"'\s<>]+\.(mp3|m3u8|aac|ogg)[^"'\s<>]*/gi) || [];
    const icecasts = data.match(/https?:\/\/[^"'\s<>]+:[0-9]+\/[^"'\s<>]*/gi) || [];
    console.log('Found streams:', [...new Set([...urls, ...icecasts])]);
    console.log('Snippet:', data.slice(0, 500));
  });
}).on('error', console.error);
