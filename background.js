import {retrieveAndUpdateCookie} from "./utils/cookieLogic.js"

// A function to retrieve the linkedin/bullhorn cookie when a linkedin/bullhorn page has finished loading
chrome.tabs.onUpdated.addListener((_, {status}, {url}) => {
  if(status === "complete" && url){
    const linkedinRegex = /https:\/\/\w{2,5}\.linkedin\.com\//g;
    const bullhornRegex = /https:\/\/app\.bullhornstaffing\.com\//g;

    if(url.match(linkedinRegex)){
      const platformName = "linkedin";
      retrieveAndUpdateCookie(platformName, {"name": "li_at", "url": "https://www.linkedin.com/"})
      .then(_ => {
        return retrieveAndUpdateCookie(platformName, {"name": "lang", "url": "https://www.linkedin.com/"});
      });
    } else if (url.match(bullhornRegex)) {
      retrieveAndUpdateCookie("bullhorn", {"name": "UlEncodedIdentity", "url": "https://app.bullhornstaffing.com/"});
    }
  }
});