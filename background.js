import {retrieveAndUpdateCookie} from "./utils/cookieLogic.js"

/**
 * This logic is triggered whenever a page loads. We then check whether it's a linkedin page or a bullhorn one, and depending on the result of the check, we trigger the right cookie retrieval logic.
 * For linkedin, we want to retrieve "li_at" and "lang" cookies, for bullhorn, we want to retrieve the "UlEncodedIdentity" one.
 */
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