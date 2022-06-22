import { isKeyInObject } from "./utils.js";

// Function to check the storage and look for the cookie of a specific platform
// Updates the cookie value if needed
export const createOrUpdateCookie = (platformName, cookieName, cookieValue, expirationDate) => {
    let storedAt = new Date(Date.now());
    storedAt = storedAt.toISOString();

    const cookieObject = {
        "value": cookieValue,
        "expires_at": expirationDate,
        "stored_at": storedAt
    }

    chrome.storage.local.get(platformName, ({platform}) => {
        if (isKeyInObject(platform, cookieName)){
            const oldCookieValue = platform[cookieName];
            if (oldCookieValue !== cookieValue){
                platform[cookieName] = cookieObject;
                chrome.storage.local.set(platform, _ => console.log(`Updated ${cookieName}`));
                if (platformName == "linkedin"){
                    console.log("Will send a request");
                }
            }
        } else {
            platform[cookieName] = cookieObject;
            chrome.storage.local.set(platform, _ => console.log(`Created ${cookieName}`));
        }
    })
};

// Function to send a request to the webhook according to the apiRequest schema

// Function to parse the Bullhorn cookie and return the bullhorn username
export const parseBullhornIdCookie = (rawCookie) => {
    const regex = /(?<=%22)[\w\d\.]+(%22)/g;
    const arrayOfMatches = rawCookie.match(regex);

    let i = 0;
    while (arrayOfMatches[i] !== "username") {
        i++
    };
    return arrayOfMatches[i+1];
}