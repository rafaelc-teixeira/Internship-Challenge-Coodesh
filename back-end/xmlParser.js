let Parser = require('rss-parser');
let parser = new Parser();

(async () => {

  let feed = await parser.parseURL('https://hipsters.tech/feed/podcast/');
  console.log(feed.title);
  console.log(feed.link);
  console.log(feed.image.url);
  ///Quantidade de episódios

  feed.items.forEach(item => {
    console.log(item.title + '://' + item.pubDate + '//:' + item.itunes.duration 
    + ':' + item.itunes.image + ':' + item.link)
    //campo para definir se o ep foi visto ou não
  });

})();