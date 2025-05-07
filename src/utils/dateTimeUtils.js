
export function getFormattedDate(timestamp = Date.now()) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份从0开始，所以要加1
    const day = date.getDate();
    return `${year}-${month}-${day}`;
}


export function getFormattedTime(timestamp = Date.now()) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}