
export function getFormattedDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 月份从0开始
    const day = today.getDate();
    return `${year}-${month}-${day}`;
}


export function getFormattedTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}