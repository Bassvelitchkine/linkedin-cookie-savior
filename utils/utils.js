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