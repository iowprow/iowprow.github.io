export const NAMESPACE = "IOWPROW";

export function writeToStorage(key, value) {
    const serializedData = localStorage.getItem(NAMESPACE);
    const data = serializedData ? JSON.parse(serializedData) : {};
    data[key] = value;
    localStorage.setItem(NAMESPACE, JSON.stringify(data));
}

export function readFromStorage(key) {
    const serializedData = localStorage.getItem(NAMESPACE);
    const data = JSON.parse(serializedData);
    return data ? data[key] : undefined;
}

export function clear() {
    localStorage.setItem(NAMESPACE, JSON.stringify({}));
}

export function removeItem(key) {
    const serializedData = localStorage.getItem(NAMESPACE);
    const data = serializedData ? JSON.parse(serializedData) : {};
    delete data[key];
    localStorage.setItem(NAMESPACE, JSON.stringify(data));
}

export function userErrorMessages(messageDiv, code, error) {
    if (code) {
        const error = code.replace('auth/', '');
        const showMessage = 'Error: You have entered an ' + error + '. Please try again.';
        messageDiv.textContent = showMessage;
        messageDiv.classList.add("error");
    } else {
        console.log('something here');
        console.log(error);
    }
}