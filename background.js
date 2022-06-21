// A function to retrieve the linkedin/bullhorn cookie when a linkedin/bullhorn page has finished loading
chrome.tabs.onUpdated.addListener((_, {status}, {url}) => {
  if(status === "complete" && url){
    if(url.match(/https:\/\/\w{2,5}\.linkedin\.com\//g)){
      chrome.cookies.get({"name": "li_at", "url": "https://www.linkedin.com/"}, res => console.log(`Le cookie ${res}`));
    }
  }
});

// 