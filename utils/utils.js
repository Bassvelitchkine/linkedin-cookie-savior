/**
 * A function that checks whether a key lies in a given object.
 * @param {Object} object the object inside which to look for a key
 * @param {String or Number} key the key to look for in the object
 * @returns {Boolean} a boolean telling whether or not we found the key in the object.
 * 
 * isKeyInObject({"value": "blabla", "platform": "linkedin"}, "value")
 * // => true;
 * 
 * isKeyInObject({"value": "blabla", "platform": "linkedin"}, "username")
 * // => false;
 * 
 * isKeyInObject({"value": "blabla", "platform": "linkedin", "cookie": {"data": stuff}}, "data")
 * // => false;
 */
export const isKeyInObject = (object, key) => {
    return Object.keys(object).reduce((acc, k) => acc || (k == key), false);
}

/**
 * An ASYNCHRONOUS function to retrieve any value in the chrome storage.local unit, if it exists. We created this function just to benefit from the promises and program asynchronously.
 * @param {String} key the key we're looking for in the chrome.storage.local unit
 * @returns {Promise} a promise that resolves to undefined if the key did not exist in chrome.storage.local, and to the value associated to the key otherwise.
 * 
 * readLocalStorage("toggle")
 * // => Promise(true);
 */
 const readLocalStorage = async (key) => {
    return new Promise((resolve, _) => {
      chrome.storage.local.get([key], function (result) {
        if (result[key] === undefined) {
          resolve(undefined);
        } else {
          resolve(result[key]);
        }
      });
    });
  };

/**
 * An ASYNCHRONOUS function to set any value in the chrome storage.local unit. We created this function just to benefit from the promises and program asynchronously. It's an asynchronous version of  chrome.storage.local.set.
 * @param {Object} object the object to write in the chrome.storage.local unit, according to chrome.storage.local.set (they both have identic parameters).
 * @returns {Promise} a promise that resolves to the object we just stored in the storage unit
 * 
 * writeToLocalStorage({"toggle": false})
 * // => Promise({"toggle": false});
 */
const writeToLocalStorage = async (object) => {
    return new Promise((resolve, _) => {
        chrome.storage.local.set(object, _ => resolve(object));
    });
};

export const savePublicIdentifier = async (publicIdentifier) => {
    const time = Date.now();
    const payload = {
        "publicIdentifier": {
            "value": publicIdentifier,
            "expires_at": null,
            "stored_at": time
        }
    };

    return readLocalStorage("linkedin")
    .then(object => {
        if (object && object["linkedin"]){
            return writeToLocalStorage({"linkedin": {...object["linkedin"], ...payload}});
        } else {
            return writeToLocalStorage({"linkedin": payload});
        }
    });
}