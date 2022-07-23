import { isKeyInObject } from "./utils.js";

const WEBHOOK = "http://127.0.0.1:5000/cookie"; // Replace with the correct webhook.

/**
 * A function that retrieves a cookie from the browser and then stores the cookie data in the chrome.local.storage using `createOrUpdateCookie`;
 * @param {String} platformName "linkedin" or "bullhorn"
 * @param {Object} cookieDetails the object holding the details of the cookie to retrieve in the browser storage.
 * @returns {Promise} a promise that resolves to the cookie data retrieved from the browser
 * 
 * retrieveAndUpdateCookie("linkedin", {"name": "li_at", "url": "https://www.linkedin.com/"})
 * // => Promise({"name": "li_at", "value": "IUHrbEIuEpABEZIUHNKLUIRNKO", ...});
 */
export const retrieveAndUpdateCookie = async (platformName, cookieDetails) => {
    return new Promise((resolve, _) => {
        chrome.cookies.get(cookieDetails, cookie => {
            createOrUpdateCookie(platformName, cookieDetails["name"], cookie["value"], cookie["expirationDate"]);
            resolve(cookie);
        });
    });
};

/**
 * A function that looks in the chrome.local.storage for a given cookie and checks whether the already cookie exists or not. If not, the cookie is created. If the cookie already existed, we update its value only if it's changed.
 * Then, depending on whether we're dealing with BH cookies or LinkedIn cookies, we do things differently. With bullhorn, we do nothing else than what was previously described. If it's linkedin, then we try to send an API request to a remote server with data on the cookie that has been created or updated with `sendCookie`.
 * @param {String} platformName "linkedin" or "bullhorn"
 * @param {String} cookieName the name of the cookie to update ("li_at", "ElEncodedIdentity", ...)
 * @param {String} cookieValue the value of the cookie
 * @param {String} expirationDate the expiration date of the cookie (if any)
 * 
 * createOrUpdateCookie("linkedin", "li_at", "IUHrbEIuEpABEZIUHNKLUIRNKO", 198765678933)
 * // => null;
 */
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

/**
 * This function checks whether a bullhorn cookie is stored in the chrome.local.storage (we need that cookie to identify the chrome extension user). If such a cookie exist, we build a payload with the id of the user in it (extracted from the bullhorn cookie) and cookie data on the linkedin cookie that has been created or updated.
 * We then send that payload to a webhook that will handle the json and resume the data processing to store the linkedin cookies in a remote spreadsheet.
 * @param {String} cookieName the name of the created/updated cookie
 * @param {Object} linkedinCookie data on the cookie that's been updated or created.
 * 
 * sendCookie("li_at", {"value": "IUHrbEIuEpABEZIUHNKLUIRNKO", "expires_at": 198765678933, "stored_at": 198455678933})
 * // => null;
 */
const sendCookie = (cookieName, linkedinCookie) => {
    chrome.storage.local.get("bullhorn", bullhorn => {
        if (bullhorn && bullhorn["bullhorn"] && bullhorn["bullhorn"]["UlEncodedIdentity"]) {
            chrome.storage.local.get("linkedin", ({linkedin}) => {
                const publicIdentifier = linkedin["publicIdentifier"]["value"];
                const headers = {
                    "Content-Type": "application/json"
                };
                const {value, expires_at, stored_at} = linkedinCookie;
                const body = {
                    "username": parseBullhornIdCookie(bullhorn["bullhorn"]["UlEncodedIdentity"]),
                    "linkedin_public_identifier": publicIdentifier,
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

            });
        } else {
            console.log("The bullhorn cookie is not in storage yet");
        }
    });
}

/**
 * A function that parses the raw "UlEncodedIdentity" cookie value to extract the username from it.
 * @param {Object} {value} the raw value of the bullhorn "UlEncodedIdentity" cookie.
 * @returns {String} the username extracted from the raw cookie value
 * 
 * parseBullhornIdCookie({"name": "UlEncodedIdentity", "value": "%7B%22identity%22%3A%7B%22username%22%3A%22bvelitchkine.walb%22%2C%22masterUserId%22%3A7027623%2C%22userId%22%3A21125%2C%22corporationId%22%3A16414%2C%22privateLabelId%22%3A24866%2C%22userTypeId%22%3A75292%2C%22userPrimaryDepartmentId%22%3A1000000%2C%22swimLaneId%22%3A22%2C%22dataCenterId%22%3A2%2C%22name%22%3A%22Bastien%20Velitchkine%22%2C%22firstName%22%3A%22Bastien%22%2C%22lastName%22%3A%22Velitchkine%22%2C%22email%22%3A%22contact%40walbpartners.com%22%2C%22locale%22%3A%22en-GB%22%2C%22corporationName%22%3A%22WALB%20Partners%22%2C%22allPrivateLabelIds%22%3A%5B24866%5D%2C%22isSReleaseULEnabled%22%3Afalse%2C%22isPasswordCaseSensitive%22%3Atrue%2C%22eStaffAgencyId%22%3A%22%22%2C%22userTypeName%22%3A%22WALB%20Partners%20Enterprise%20Admin%20User%22%2C%22departmentName%22%3A%22WALB%20Partners%22%7D%2C%22sessions%22%3A%5B%7B%22name%22%3A%22rest%22%2C%22value%22%3A%7B%22token%22%3A%228510535c-92e5-4969-8ba7-efd84b5934a1%22%2C%22endpoint%22%3A%22https%3A%2F%2Frest22.bullhornstaffing.com%2Frest-services%2F4gelc4%2F%22%7D%7D%2C%7B%22name%22%3A%22coldfusion%22%2C%22value%22%3A%7B%22token%22%3A%22%22%2C%22endpoint%22%3A%22https%3A%2F%2Fcls22.bullhornstaffing.com%22%7D%7D%2C%7B%22name%22%3A%22canvas%22%2C%22value%22%3A%7B%22token%22%3A%22%22%2C%22endpoint%22%3A%22https%3A%2F%2Fukbigateway.bullhorn.com%2Fcanvas%2Fcgi-bin%2Fcognosisapi.dll%22%7D%7D%2C%7B%22name%22%3A%22novo%22%2C%22value%22%3A%7B%22endpoint%22%3A%22https%3A%2F%2Fapp.bullhornstaffing.com%22%7D%7D%2C%7B%22name%22%3A%22documentEditor%22%2C%22value%22%3A%7B%22endpoint%22%3A%22https%3A%2F%2Fdocs-emea.bullhornstaffing.com%2Fdocument%2F%22%7D%7D%2C%7B%22name%22%3A%22ul%22%2C%22value%22%3A%7B%22endpoint%22%3A%22https%3A%2F%2Fukuniversal.bullhornstaffing.com%2Funiversal-login%22%7D%7D%5D%2C%22apps%22%3A%5B%7B%22name%22%3A%22novo%22%2C%22enabled%22%3Atrue%7D%5D%2C%22requestUrl%22%3A%22http%3A%2F%2Funiversal.bullhornstaffing.com%2Funiversal-login%22%2C%22redirectUrl%22%3A%22https%3A%2F%2Fapp.bullhornstaffing.com%22%7D", ...})
 * // => "bvelitchkine.walb";
 */
const parseBullhornIdCookie = ({value}) => {
    const regex = /(?<=%22)[\w\d\.]+/g;
    const arrayOfMatches = value.match(regex);

    let i = 0;
    while (arrayOfMatches[i] !== "username") {
        i++
    };
    return arrayOfMatches[i+1];
}

/**
 * A function that extract the code string of the language from the raw value of the linkedin "lang" cookie.
 * @param {String} value the raw value of the linkedin "lang" cookie
 * @returns {String} the code string telling the language the linkedin profile of the user was set to.
 * 
 * parseLinkedInLangCookie("v=2&lang=fr-FR")
 * // => "fr";
 * 
 * parseLinkedInLangCookie("v=2&lang=en-US")
 * // => "us";
 */
const parseLinkedInLangCookie = (value) => {
    const regex = /(?<=\-).+/g;
    const match = value.match(regex);
    if (match) {
        return String(match[0]).toLowerCase();
    } else {
        return ""
    }
};