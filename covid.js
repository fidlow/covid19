const axios = require("axios");
const jsdom = require("jsdom");
var fs = require("fs");

async function getCovid19Info(lag) {
  try {
    const url = getUrl();
    const items = await getItems(url);  
    const russiaFirstIndex = items.findIndex(
      (o) => o.name === "Алтайский край"
    );
    const russiaFirstHistogram = items[russiaFirstIndex].histogram;
    const [lastItemRussiaFirstHistogram] = russiaFirstHistogram.slice(lag ? lag : -1);
    printDate(lastItemRussiaFirstHistogram.ts);
    const russiaItems = items.slice(russiaFirstIndex);
    const cases = russiaItems.map((o) => o.histogram.slice(lag ? lag : -1)[0].value);
	const date = getDateString(lastItemRussiaFirstHistogram.ts);
    cases.unshift(date);
    console.log(date);
    const res = cases.join("\n");
    fs.writeFile("covid.csv", res, function (err) {
      if (err) return console.log(err);
      console.log("Wrote in covid.csv");
    });
  } catch (error) {
    console.error(error);
  }

  function getUrl() {
    const url = "https://yandex.ru/maps/covid19";    
    return url;
  }
  async function getItems(url) {  
    const response = await axios.get(url);
    const { JSDOM } = jsdom;
    const { document } = (new JSDOM(response.data)).window;
    const html = document.getElementsByClassName("config-view")[0].innerHTML;
    const json = JSON.parse(html);
    return json.covidData.items;
  }

  async function getUrlAndCookieOld() {
    const url = "https://yandex.ru/maps/api/covid19";
    const response1 = await axios.get(url);
    const {
      data: { csrfToken },
    } = response1;
    const cookie = response1.headers["set-cookie"][0];
    let urlWithCsrf = `https://yandex.ru/maps/api/covid?ajax=1&csrfToken=${csrfToken}&lang=ru&s=3701076815&sessionId=1591195411184_644096`;
    console.log(urlWithCsrf)
    return { url: urlWithCsrf, cookie };
  }  
  async function getItemsOld(url, cookie) {
    const responseWithCsrf = await axios({
      method: "get",
      url,
      headers: { Cookie: cookie },
    });
    console.log(responseWithCsrf)
    const {
      data: {
        data: { items },
      },
    } = responseWithCsrf;
    return items;
  }
  function printDate(timestamp) {
    const today = new Date();
    today.setHours(5,0,0,0)
    const dateInfo = new Date();
    dateInfo.setTime(timestamp * 1000);
    if(dateInfo.getTime()-today.getTime() === -86400000) 
      console.log("Yesterday");
    else
      console.log(dateInfo.getTime() === today.getTime() ? "Today" : "Not Today!!");
  }
  function getDateString(timestamp) {
    const dateInfo = new Date();
    dateInfo.setTime(timestamp * 1000);
    const options = { day: "numeric", month: "2-digit", year: "numeric" };
    return dateInfo.toLocaleDateString("ru", options);
  }
}

getCovid19Info(process.argv[2]);