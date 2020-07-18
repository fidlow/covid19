var fs = require("fs");

fs.readFile("yandex-covid.json", "utf8", function (err, contents) {
  let {
    data: { items },
  } = JSON.parse(contents);
  const russiaFirstIndex = items.findIndex((o) => o.name === "Алтайский край");
  const russiaFirstHistogram = items[russiaFirstIndex].histogram;
  const [lastItemRussiaFirstHistogram] = russiaFirstHistogram.slice(-1);
  printDate(lastItemRussiaFirstHistogram.ts);
  const russiaItems = items.slice(russiaFirstIndex);
  const cases = russiaItems.map((o) => o.cases);
  //russiaItems.map((o) => console.log(`${o.cases}`));
  fs.writeFile("covid.csv", cases.join("\n"), function (err) {
    if (err) return console.log(err);
    console.log("Wrote in covid.csv");
  });
});

function printDate(timestamp) {
    const dateInfo = new Date();
    dateInfo.setTime(timestamp * 1000);
    const options = { day: 'numeric', month: 'long', year:"numeric"}; 
    console.log(dateInfo.toLocaleDateString('en', options))
}
