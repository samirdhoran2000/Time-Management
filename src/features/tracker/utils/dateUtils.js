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

export const getDayName = (isoDate) => {
    if (!isoDate) return '';
    const dateObj = new Date(isoDate);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dateObj.getDay()];
};

export const calculateDuration = (inTime, outTime) => {
    if (!inTime || !outTime) return 0;

    const parseTime = (timeStr) => {
        if (!timeStr) return 0;
        const match = timeStr.match(/(\d+):?(\d+)?\s*(AM|PM)?/i);
        if (!match) return 0;

        let hours = parseInt(match[1], 10);
        let minutes = match[2] ? parseInt(match[2], 10) : 0;
        const modifier = match[3] ? match[3].toUpperCase() : null;

        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        return hours * 60 + minutes;
    };

    try {
        const inMinutes = parseTime(inTime);
        const outMinutes = parseTime(outTime);

        let diff = outMinutes - inMinutes;
        // Handle overnight shifts
        if (diff < 0) diff += 24 * 60;

        return diff;
    } catch (e) {
        return 0;
    }
};

export const formatMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0 && minutes === 0) return '0h';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
};
