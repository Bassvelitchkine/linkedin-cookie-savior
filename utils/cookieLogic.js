import { isKeyInObject } from "./utils.js";

const WEBHOOK = "http://127.0.0.1:5000/cookie";

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
    const storedAt = Date.now();

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
                    chrome.storage.local.set(platformStorage, _ => {
                        if (platformName == "linkedin"){
                            sendCookie(cookieName, cookieParams);
                        }
                    });
                }
            } else {
                platformStorage[platformName][cookieName] = cookieParams;
                chrome.storage.local.set(platformStorage, _ => {
                    if (platformName == "linkedin"){
                        sendCookie(cookieName, cookieParams);
                    }
                });
            }
        } else {
            let cookieObject = {};
            cookieObject[cookieName] = cookieParams;

            const platformStorage = {};
            platformStorage[platformName] = cookieObject;

            chrome.storage.local.set(platformStorage, _ => {
                if (platformName == "linkedin"){
                    sendCookie(cookieName, cookieParams);
                }
            });
        }
    });
};

// Function to send a request to the webhook according to the apiRequest schema
const sendCookie = (cookieName, linkedinCookie) => {
    chrome.storage.local.get("bullhorn", bullhorn => {
        if (bullhorn && bullhorn["bullhorn"] && bullhorn["bullhorn"]["UlEncodedIdentity"]) {
            const headers = {
                "Content-Type": "application/json"
            };
            console.log(linkedinCookie);
            const {value, expires_at, stored_at} = linkedinCookie;
            const body = {
                "username": parseBullhornIdCookie(bullhorn["bullhorn"]["UlEncodedIdentity"]),
                "cookie": {
                    "name": cookieName,
                    "value": (cookieName == "lang" ? parseLinkedInLangCookie(value): value),
                    expires_at,
                    stored_at
                }
            };

            const request = new Request(WEBHOOK, {"method": "POST", "body": JSON.stringify(body), headers});
            fetch(request).then(response => {
                if (response.ok) {
                    console.log("Successful response");
                } else {
                    console.log(response);
                }
            });
        } else {
            console.log("The bullhorn cookie is not in storage yet");
        }
    });
}

// Function to parse the Bullhorn cookie and return the bullhorn username
const parseBullhornIdCookie = ({value}) => {
    const regex = /(?<=%22)[\w\d\.]+/g;
    const arrayOfMatches = value.match(regex);

    let i = 0;
    while (arrayOfMatches[i] !== "username") {
        i++
    };
    return arrayOfMatches[i+1];
}

const parseLinkedInLangCookie = (value) => {
    const regex = /(?<=\-).+/g;
    const match = value.match(regex);
    if (match) {
        return String(match[0]).toLowerCase();
    } else {
        return ""
    }
};