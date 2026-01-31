import { useState, useEffect, useCallback } from 'react';
import * as jose from 'jose';

export const useGoogleSheets = () => {
    // State for Credentials & Config
    const [credentials, setCredentials] = useState(null);
    const [spreadsheetId, setSpreadsheetId] = useState('');
    const [sheetName, setSheetName] = useState('Sheet1');

    // State for Session
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load from localStorage on mount
    useEffect(() => {
        const storedCreds = localStorage.getItem('time_mgmt_creds');
        const storedSheetId = localStorage.getItem('time_mgmt_sheet_id');

        if (storedCreds) {
            try {
                setCredentials(JSON.parse(storedCreds));
            } catch (err) {
                console.error("Failed to parse stored credentials", err);
            }
        }
        if (storedSheetId) {
            setSpreadsheetId(storedSheetId);
        }
    }, []);

    // Save credentials to state and local storage
    const saveCredentials = (json) => {
        setCredentials(json);
        localStorage.setItem('time_mgmt_creds', JSON.stringify(json));
    };

    // Save Spreadsheet ID
    const updateSpreadsheetId = (id) => {
        setSpreadsheetId(id);
        localStorage.setItem('time_mgmt_sheet_id', id);
    };

    // Clear everything
    const logout = () => {
        setCredentials(null);
        setAccessToken(null);
        localStorage.removeItem('time_mgmt_creds');
        // We might want to keep the spreadsheet ID? For now, let's keep it.
        // localStorage.removeItem('time_mgmt_sheet_id'); 
    };

    // Authenticate
    const authenticate = useCallback(async () => {
        if (!credentials) {
            setError("No credentials found");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { client_email, private_key } = credentials;

            const jwt = await new jose.SignJWT({
                iss: client_email,
                scope: 'https://www.googleapis.com/auth/spreadsheets',
                aud: 'https://oauth2.googleapis.com/token',
                exp: Math.floor(Date.now() / 1000) + 3600,
                iat: Math.floor(Date.now() / 1000),
            })
                .setProtectedHeader({ alg: 'RS256' })
                .sign(await jose.importPKCS8(private_key, 'RS256'));

            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    assertion: jwt,
                }),
            });

            if (!response.ok) {
                throw new Error(`Auth failed: ${response.statusText}`);
            }

            const tokenData = await response.json();
            setAccessToken(tokenData.access_token);

            // Fetch Sheet Details (Name and GID)
            // We assume we are working with the first sheet
            const metadataRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties&key=${tokenData.access_token}`);
            if (metadataRes.ok) {
                const metadata = await metadataRes.json();
                const firstSheet = metadata.sheets[0];
                setSheetName(firstSheet.properties.title);
                // Store GID for deletions
                localStorage.setItem('time_mgmt_sheet_gid', firstSheet.properties.sheetId);
            }

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [credentials, spreadsheetId]);

    // Read Data
    const fetchRows = useCallback(async () => {
        if (!accessToken || !spreadsheetId) return null;

        setLoading(true);
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A:Z`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const result = await res.json();

            if (result.error) throw new Error(result.error.message);

            return result.values || [];
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [accessToken, spreadsheetId, sheetName]);

    // Append Row
    const appendRow = useCallback(async (rowArray) => {
        if (!accessToken || !spreadsheetId) return;

        setLoading(true);
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ values: [rowArray] })
            });

            const result = await res.json();
            if (result.error) throw new Error(result.error.message);

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [accessToken, spreadsheetId, sheetName]);

    // Update Row
    const updateRow = useCallback(async (rowIndex, rowArray) => {
        if (!accessToken || !spreadsheetId) return;

        // rowIndex is 0-based index from the UI entries (which excludes header)
        // So UI index 0 -> Sheet Row 2
        const range = `${sheetName}!A${rowIndex + 2}`;

        setLoading(true);
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
            const res = await fetch(url, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                // We update just the row
                body: JSON.stringify({ values: [rowArray] })
            });

            const result = await res.json();
            if (result.error) throw new Error(result.error.message);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [accessToken, spreadsheetId, sheetName]);

    // Delete Row
    const deleteRow = useCallback(async (rowIndex) => {
        if (!accessToken || !spreadsheetId) return;

        // Need GID
        const sheetId = localStorage.getItem('time_mgmt_sheet_gid');
        if (sheetId === null) {
            setError("Sheet GID not found. Please reconnect.");
            return;
        }

        // rowIndex 0 (UI) -> Row 2 (Sheet) -> Index 1 (API)
        const startIndex = rowIndex + 1;
        const endIndex = startIndex + 1;

        setLoading(true);
        try {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    requests: [{
                        deleteDimension: {
                            range: {
                                sheetId: parseInt(sheetId),
                                dimension: 'ROWS',
                                startIndex: startIndex,
                                endIndex: endIndex
                            }
                        }
                    }]
                })
            });

            const result = await res.json();
            if (result.error) throw new Error(result.error.message);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [accessToken, spreadsheetId]);

    return {
        // State
        credentials,
        spreadsheetId,
        sheetName,
        accessToken,
        loading,
        error,

        // Setters
        setSheetName,
        updateSpreadsheetId,

        // Actions
        saveCredentials,
        authenticate,
        logout,
        fetchRows,
        appendRow,
        updateRow,
        deleteRow
    };
};
