export const extractPublicIdentifier = () => {
    const regex = /(?<=\"publicIdentifier\"\:\")[\w\d\.\-]+/g
    const codeNodes = document.querySelectorAll("code");
    let result = "";
    codeNodes.forEach(codeNode => {
        const matches = codeNode.innerText.match(regex);
        if (matches) {
            result = matches[0];
        }
    });
    return result;
}