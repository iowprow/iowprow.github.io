export function include(filePath) {
    const scriptTag = document.createElement("script");
    scriptTag.src = filePath;
    document.body.appendChild(scriptTag);
}
