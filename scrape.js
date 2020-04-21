const rp = require("request-promise-native");
const cheerio = require("cheerio");
const entriesDb = require("./database/entries");
const fs = require("fs");

const baseUrl =
  "https://www.sweclockers.com/forum/trad/1079311-sweclockers-marknadsreferenser-las-forsta-inlagget-innan-du-postar?p=";
const getPagesOptions = {
  uri:
    "https://www.sweclockers.com/forum/trad/1079311-sweclockers-marknadsreferenser-las-forsta-inlagget-innan-du-postar/sista-sidan",
  resolveWithFullResponse: true,
  followAllRedirects: true,
};

if (!fs.existsSync("data.json")) {
  data = {
    scrapedUpTo: 0,
  };
  fs.writeFileSync("data.json", JSON.stringify(data));
}

function pageToStart() {
  data = JSON.parse(fs.readFileSync("data.json"));
  if (data.scrapedUpTo == 0) {
    return 1;
  } else {
    return data.scrapedUpTo;
  }
}

module.exports = async function () {
  // Get how many pages there are
  let pageAmount = 1;
  const getPagesResponse = await rp(getPagesOptions);
  pageAmount = parseInt(getPagesResponse.request.uri.href.split("p=").pop());
  console.log(`Found ${pageAmount} pages...`);

  let entries = [];

  // Loop through all pages, make a request to each page and scrape them
  for (x in Array.from(Array(pageAmount).keys())) {
    const page = parseInt(x) + 1;
    const startPage = pageToStart();

    if (page < startPage) continue;

    const pageUrl = baseUrl + page;
    console.log(`Scraping page: ${page}...`);

    const options = {
      uri: pageUrl,
      followAllRedirects: false,
    };

    const body = await rp(options);
    const $ = cheerio.load(body);

    // Loop through each post on the page
    $(".forumPost").each(function (i, elem) {
      // One entry represents one post (one rating, reference)
      let entry = {};
      entry.giver = $(this).find(".name span").first().text();
      entry.date = Date.parse($(this).find("time").first().attr("datetime"));

      // Check if there is only one mention, if not, skip the post. If yes,
      // set the mentioned username as receiver.
      const mentions = $(this).find(".bbParagraph .bbReply");
      if (mentions.length != 1) {
        return;
      }
      entry.receiver = mentions.first().text().split("@").pop();

      // Match post with rating regex, verify the number and apply it to the object.
      const ratingRegex = /[0-5](\s*.?\s*\d)?\s*\/\s*5/g;
      const found = $(this)
        .find(".postBody .main .text .bbcode")
        .text()
        .match(ratingRegex);
      if (found == null || found.length > 1) {
        return;
      }
      const rating = Number.parseFloat(
        found[0].split("/").shift().replace(",", ".")
      );
      if (Number.isNaN(rating)) {
        return;
      }
      if (rating > 5) {
        return;
      }
      entry.rating = rating;

      entry.permalink = $(this)
        .find(".postHeader .headerLink.postNum")
        .first()
        .attr("href");

      entries.push(entry);
    });
    await timeout(1000);
  }

  console.log("Scraping done, uploading to database...");
  let added = 0;
  entries.forEach((entry) => {
    entriesDb.add(entry);
    added++;
  });
  console.log("Added " + added + " entries to database");

  // Don't want to scrape all pages next time, only the last one and everything after
  console.log("Updating data...");
  data = JSON.parse(fs.readFileSync("data.json"));
  data.scrapedUpTo = pageAmount;
  fs.writeFileSync("data.json", JSON.stringify(data));
  console.log("Updated data, current head: " + pageAmount);
};

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Test start
try {
  module.exports();
} catch (error) {
  console.log("Error: " + error);
}
// Test end
