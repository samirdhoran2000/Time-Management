import * as jose from 'jose';
import { GOOGLE_AUTH_URL } from '../constants';

/**
 * Fetches an access token from Google using Service Account credentials
 * @param {Object} credentials - The Google Service Account JSON credentials
 * @returns {Promise<string>} - The access token
 */
export const getAccessToken = async (credentials) => {
    if (!credentials) {
        throw new Error("No credentials provided");
    }

    const { client_email, private_key } = credentials;

    const jwt = await new jose.SignJWT({
        iss: client_email,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: GOOGLE_AUTH_URL,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
    })
        .setProtectedHeader({ alg: 'RS256' })
        .sign(await jose.importPKCS8(private_key, 'RS256'));

    const response = await fetch(GOOGLE_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Auth failed: ${errorData.error_description || response.statusText}`);
    }

    const tokenData = await response.json();
    return tokenData.access_token;
};
