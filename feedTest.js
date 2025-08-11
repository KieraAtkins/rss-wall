const Parser = require('rss-parser');
const parser = new Parser();

(async () => {
  const feed = await parser.parseURL('https://www.ecfdata.com/feed/');
  feed.items.forEach((item, idx) => {
    console.log(`\n--- Item ${idx + 1} ---`);
    console.log(item);
  });
})();