import { isKeyInObject } from "./utils.js";

export const retrieveAndUpdateCookie = async (platformName, cookieDetails) => {
    return new Promise((resolve, _) => {
        chrome.cookies.get(cookieDetails, cookie => {
            createOrUpdateCookie(platformName, cookieDetails["name"], cookie["value"], cookie["expirationDate"]);
            resolve(cookie);
        });
    });
};

// Function to check the storage and look for the cookie of a specific platform
// Updates the cookie value if needed
const createOrUpdateCookie = (platformName, cookieName, cookieValue, expirationDate) => {
    let storedAt = new Date(Date.now());
    storedAt = storedAt.toISOString();

    const cookieParams = {
        "value": cookieValue,
        "expires_at": expirationDate,
        "stored_at": storedAt
    };

    chrome.storage.local.get(platformName, platformStorage => {
        if (platformStorage && platformStorage[platformName]){
            if (isKeyInObject(platformStorage[platformName], cookieName)){
                const oldCookieValue = platformStorage[platformName][cookieName]["value"];
                if (oldCookieValue !== cookieValue){
                    platformStorage[platformName][cookieName] = cookieParams;
                    chrome.storage.local.set(platformStorage, _ => console.log(`Updated ${cookieName}`));
                    if (platformName == "linkedin"){
                        console.log("Will send a request");
                    }
                }
            } else {
                platformStorage[platformName][cookieName] = cookieParams;
                chrome.storage.local.set(platformStorage, _ => console.log(`Created ${cookieName}`));
                if (platformName == "linkedin"){
                    console.log("Will send a request");
                }
            }
        } else {
            let cookieObject = {};
            cookieObject[cookieName] = cookieParams;

            const platformStorage = {};
            platformStorage[platformName] = cookieObject;

            chrome.storage.local.set(platformStorage, _ => console.log(`Created ${cookieName}`));
            if (platformName == "linkedin"){
                console.log("Will send a request");
            }
        }
    });
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