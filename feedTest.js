const Parser = require('rss-parser');
const parser = new Parser();

(async () => {
  const feed = await parser.parseURL('https://swopusa.org/blog/rss.xml');
  feed.items.forEach((item, idx) => {
    console.log(`\n--- Item ${idx + 1} ---`);
    console.log(item);
  });
})();