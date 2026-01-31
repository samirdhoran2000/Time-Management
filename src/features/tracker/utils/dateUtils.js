export const getTodayLocal = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatDateForSheet = (isoDate) => {
    // Input: yyyy-mm-dd -> Output: dd-mm-yyyy
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}-${m}-${y}`;
};

export const parseDateFromSheet = (sheetDate) => {
    // Input: dd-mm-yyyy -> Output: yyyy-mm-dd
    if (!sheetDate) return '';

    // Try dash first
    if (sheetDate.includes('-')) {
        const parts = sheetDate.split('-');
        if (parts.length !== 3) return sheetDate;
        const [d, m, y] = parts;
        return `${y}-${m}-${d}`;
    }

    // Fallback for previous colon format
    if (sheetDate.includes(':')) {
        const parts = sheetDate.split(':');
        if (parts.length !== 3) return sheetDate;
        const [d, m, y] = parts;
        return `${y}-${m}-${d}`;
    }

    return sheetDate;
};
