import { GOOGLE_SHEETS_BASE_URL } from '../constants';

/**
 * Flexible API client for Google Sheets
 * @param {string} endpoint - The API endpoint (relative to base URL)
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<any>} - The JSON response
 */
export const request = async (endpoint, options = {}) => {
    const { accessToken, ...fetchOptions } = options;

    const url = endpoint.startsWith('http')
        ? endpoint
        : `${GOOGLE_SHEETS_BASE_URL}/${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || response.statusText || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};
