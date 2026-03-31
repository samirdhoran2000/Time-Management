import { useState, useEffect, useCallback } from 'react';
import { LOCAL_STORAGE_KEYS } from '../constants';
import { getAccessToken } from '../utils/googleAuth';
import * as sheetsService from '../services/googleSheetsService';

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
        const storedCreds = localStorage.getItem(LOCAL_STORAGE_KEYS.CREDENTIALS);
        const storedSheetId = localStorage.getItem(LOCAL_STORAGE_KEYS.SPREADSHEET_ID);

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
        const storedSheetName = localStorage.getItem(LOCAL_STORAGE_KEYS.SHEET_NAME);
        if (storedSheetName) {
            setSheetName(storedSheetName);
        }
        const storedAllSheets = localStorage.getItem(LOCAL_STORAGE_KEYS.ALL_SHEETS);
        if (storedAllSheets) {
            try {
                setAllSheets(JSON.parse(storedAllSheets));
            } catch (err) { }
        }
    }, []);

    // Save credentials to state and local storage
    const saveCredentials = (json) => {
        setCredentials(json);
        localStorage.setItem(LOCAL_STORAGE_KEYS.CREDENTIALS, JSON.stringify(json));
    };

    const updateSpreadsheetId = (id) => {
        setSpreadsheetId(id);
        localStorage.setItem(LOCAL_STORAGE_KEYS.SPREADSHEET_ID, id);
    };

    // Save Sheet Name
    const updateSheetName = (name) => {
        setSheetName(name);
        localStorage.setItem(LOCAL_STORAGE_KEYS.SHEET_NAME, name);

        // Also update GID for deletions when switching
        const sheet = allSheets.find(s => s.title === name);
        if (sheet) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.SHEET_GID, sheet.sheetId);
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
            const token = await getAccessToken(credentials);

            // Fetch Sheet Details (Name and GID) - THIS VALIDATES THE SPREADSHEET ID
            const metadata = await sheetsService.fetchSpreadsheetMetadata(spreadsheetId, token);
            const sheets = metadata.sheets.map(s => s.properties);

            // If we are here, everything is valid
            setAccessToken(token);
            setAllSheets(sheets);
            localStorage.setItem(LOCAL_STORAGE_KEYS.ALL_SHEETS, JSON.stringify(sheets));

            // Prefer persisted sheetName, or current state, or default to first
            const targetName = localStorage.getItem(LOCAL_STORAGE_KEYS.SHEET_NAME) || sheetName;
            const exists = sheets.find(s => s.title === targetName);

            if (exists) {
                setSheetName(exists.title);
                localStorage.setItem(LOCAL_STORAGE_KEYS.SHEET_GID, exists.sheetId);
                localStorage.setItem(LOCAL_STORAGE_KEYS.SHEET_NAME, exists.title);
            } else if (sheets.length > 0) {
                setSheetName(sheets[0].title);
                localStorage.setItem(LOCAL_STORAGE_KEYS.SHEET_GID, sheets[0].sheetId);
                localStorage.setItem(LOCAL_STORAGE_KEYS.SHEET_NAME, sheets[0].title);
            }

        } catch (err) {
            console.error("Connection failed:", err);
            setAccessToken(null); // Reset access token if validation fails
            setAllSheets([]); // Clear sheets on error
            setError(err.message === "Unexpected token '<', \"<!DOCTYPE h\"... is not valid JSON"
                ? "Invalid Spreadsheet ID or no permission"
                : err.message);
        } finally {
            setLoading(false);
        }
    }, [credentials, spreadsheetId, sheetName]);

    // Read Data
    const fetchRows = useCallback(async () => {
        if (!accessToken || !spreadsheetId) return null;

        setLoading(true);
        try {
            return await sheetsService.fetchRows(spreadsheetId, sheetName, accessToken);
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
            return await sheetsService.appendRow(spreadsheetId, sheetName, accessToken, rowArray);
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

        setLoading(true);
        try {
            return await sheetsService.updateRow(spreadsheetId, sheetName, accessToken, rowIndex, rowArray);
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
        const sheetId = localStorage.getItem(LOCAL_STORAGE_KEYS.SHEET_GID);
        if (sheetId === null) {
            setError("Sheet GID not found. Please reconnect.");
            return;
        }

        setLoading(true);
        try {
            return await sheetsService.deleteRow(spreadsheetId, sheetId, accessToken, rowIndex);
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
            const newSheetProps = await sheetsService.createSheet(spreadsheetId, accessToken, name);

            // Update State
            setSheetName(name);
            const updatedSheets = [...allSheets, newSheetProps];
            setAllSheets(updatedSheets);
            localStorage.setItem(LOCAL_STORAGE_KEYS.ALL_SHEETS, JSON.stringify(updatedSheets));
            localStorage.setItem(LOCAL_STORAGE_KEYS.SHEET_GID, newSheetProps.sheetId);
            localStorage.setItem(LOCAL_STORAGE_KEYS.SHEET_NAME, name);

            return { replies: [{ addSheet: { properties: newSheetProps } }] };
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [accessToken, spreadsheetId, allSheets]);

    // Apply Holiday Formatting
    const setHolidayFormatting = useCallback(async (rowIndex, isHoliday) => {
        if (!accessToken || !spreadsheetId) return;
        
        const sheetId = localStorage.getItem(LOCAL_STORAGE_KEYS.SHEET_GID);
        if (sheetId === null) {
             console.warn("Sheet GID not found for holiday formatting.");
             return;
        }
        
        try {
             await sheetsService.setRowMergeAndFormat(spreadsheetId, sheetId, accessToken, rowIndex, isHoliday);
        } catch (err) {
             console.error("Failed to set holiday formatting:", err);
             // We won't block the UI if just formatting fails
        }
    }, [accessToken, spreadsheetId]);

    // Move Row
    const moveRowAction = useCallback(async (sourceRowIndex, destinationRowIndex) => {
        if (!accessToken || !spreadsheetId) return;

        const sheetId = localStorage.getItem(LOCAL_STORAGE_KEYS.SHEET_GID);
        if (sheetId === null) {
            setError("Sheet GID not found. Please reconnect.");
            return;
        }

        setLoading(true);
        try {
            return await sheetsService.moveRow(spreadsheetId, sheetId, accessToken, sourceRowIndex, destinationRowIndex);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [accessToken, spreadsheetId]);

    return {
        // ... state ...
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
        moveRow: moveRowAction,
        createSheet,
        setHolidayFormatting
    };
};
