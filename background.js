// A function to retrieve the linkedin/bullhorn cookie when a linkedin/bullhorn page has finished loading
chrome.tabs.onUpdated.addListener((_, {status}, {url}) => {
  if(status === "complete" && url){
    const linkedinRegex = /https:\/\/\w{2,5}\.linkedin\.com\//g;
    const bullhornRegex = /https:\/\/app\.bullhornstaffing\.com\//g;
    if(url.match(linkedinRegex)){
      chrome.cookies.get({"name": "li_at", "url": "https://www.linkedin.com/"}, res => console.log(res));
      chrome.cookies.get({"name": "lang", "url": "https://www.linkedin.com/"}, res => console.log(res));
    } else if (url.match(bullhornRegex)) {
      chrome.cookies.get({"name": "UlEncodedIdentity", "url": "https://app.bullhornstaffing.com/"}, res => console.log(res));
    }
  }
});