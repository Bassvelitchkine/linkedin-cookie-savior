export const isKeyInObject = (object, key) => {
    return Object.keys(object).reduce((acc, k) => acc || (k == key));
}