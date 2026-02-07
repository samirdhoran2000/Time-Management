import { useState, useEffect, useCallback } from 'react';
import * as jose from 'jose';

export const useGoogleSheets = () => {
    // State for Credentials & Config
    const [credentials, setCredentials] = useState(null);
    const [spreadsheetId, setSpreadsheetId] = useState('');
    const [sheetName, setSheetName] = useState('Sheet1');
    const [allSheets, setAllSheets] = useState([]); // List of {title, sheetId}

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
        const storedSheetName = localStorage.getItem('time_mgmt_sheet_name');
        if (storedSheetName) {
            setSheetName(storedSheetName);
        }
        const storedAllSheets = localStorage.getItem('time_mgmt_all_sheets');
        if (storedAllSheets) {
            try {
                setAllSheets(JSON.parse(storedAllSheets));
            } catch (err) { }
        }
    }, []);

    // Save credentials to state and local storage
    const saveCredentials = (json) => {
        setCredentials(json);
        localStorage.setItem('time_mgmt_creds', JSON.stringify(json));
    };

    const updateSpreadsheetId = (id) => {
        setSpreadsheetId(id);
        localStorage.setItem('time_mgmt_sheet_id', id);
    };

    // Save Sheet Name
    const updateSheetName = (name) => {
        setSheetName(name);
        localStorage.setItem('time_mgmt_sheet_name', name);

        // Also update GID for deletions when switching
        const sheet = allSheets.find(s => s.title === name);
        if (sheet) {
            localStorage.setItem('time_mgmt_sheet_gid', sheet.sheetId);
        }
    };

    // Clear everything
    const logout = () => {
        setCredentials(null);
        setAccessToken(null);
        setSpreadsheetId('');
        setSheetName('');
        setAllSheets([]);
        setError(null);
        setLoading(false);
        localStorage.clear();
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
            const metadataRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties(title,sheetId)`, {
                headers: { Authorization: `Bearer ${tokenData.access_token}` }
            });
            if (metadataRes.ok) {
                const metadata = await metadataRes.json();
                const sheets = metadata.sheets.map(s => s.properties);
                setAllSheets(sheets);
                localStorage.setItem('time_mgmt_all_sheets', JSON.stringify(sheets));

                // Prefer persisted sheetName, or current state, or default to first
                const targetName = localStorage.getItem('time_mgmt_sheet_name') || sheetName;
                const exists = sheets.find(s => s.title === targetName);

                if (exists) {
                    setSheetName(exists.title);
                    localStorage.setItem('time_mgmt_sheet_gid', exists.sheetId);
                    localStorage.setItem('time_mgmt_sheet_name', exists.title);
                } else if (sheets.length > 0) {
                    setSheetName(sheets[0].title);
                    localStorage.setItem('time_mgmt_sheet_gid', sheets[0].sheetId);
                    localStorage.setItem('time_mgmt_sheet_name', sheets[0].title);
                }
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

    // Create New Sheet
    const createSheet = useCallback(async (name) => {
        if (!accessToken || !spreadsheetId) return;

        setLoading(true);
        try {
            // 1. Create the sheet
            const createUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
            const createRes = await fetch(createUrl, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    requests: [{
                        addSheet: {
                            properties: { title: name }
                        }
                    }]
                })
            });

            const createResult = await createRes.json();
            if (createResult.error) throw new Error(createResult.error.message);

            const newSheetProps = createResult.replies[0].addSheet.properties;

            // 2. Initialize Headers in the new sheet
            const headers = ['Date', 'Day', 'InTime', 'OutTime', 'Charges', 'Expenses', 'Kilometres', 'Location', 'Petrol'];
            const headerUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${name}!A1:Z1?valueInputOption=USER_ENTERED`;
            await fetch(headerUrl, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ values: [headers] })
            });

            // 3. Update State
            setSheetName(name);
            const updatedSheets = [...allSheets, newSheetProps];
            setAllSheets(updatedSheets);
            localStorage.setItem('time_mgmt_all_sheets', JSON.stringify(updatedSheets));
            localStorage.setItem('time_mgmt_sheet_gid', newSheetProps.sheetId);
            localStorage.setItem('time_mgmt_sheet_name', name);

            return createResult;
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
        allSheets,
        accessToken,
        loading,
        error,

        // Setters
        setSheetName: updateSheetName,
        updateSpreadsheetId,

        // Actions
        saveCredentials,
        authenticate,
        logout,
        fetchRows,
        appendRow,
        updateRow,
        deleteRow,
        createSheet
    };
};
