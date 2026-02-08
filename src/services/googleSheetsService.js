import { request } from './apiClient';

/**
 * Service for interacting with Google Sheets API
 */

export const fetchSpreadsheetMetadata = async (spreadsheetId, accessToken) => {
    return request(`${spreadsheetId}?fields=sheets.properties(title,sheetId)`, {
        accessToken
    });
};

export const fetchRows = async (spreadsheetId, sheetName, accessToken) => {
    const data = await request(`${spreadsheetId}/values/${sheetName}!A:Z`, {
        accessToken
    });
    return data.values || [];
};

export const appendRow = async (spreadsheetId, sheetName, accessToken, rowArray) => {
    return request(`${spreadsheetId}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        accessToken,
        body: JSON.stringify({ values: [rowArray] })
    });
};

export const updateRow = async (spreadsheetId, sheetName, accessToken, rowIndex, rowArray) => {
    // UI index 0 -> Sheet Row 2
    const range = `${sheetName}!A${rowIndex + 2}`;
    return request(`${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        accessToken,
        body: JSON.stringify({ values: [rowArray] })
    });
};

export const deleteRow = async (spreadsheetId, sheetId, accessToken, rowIndex) => {
    // rowIndex 0 (UI) -> Row 2 (Sheet) -> Index 1 (API)
    const startIndex = rowIndex + 1;
    const endIndex = startIndex + 1;

    return request(`${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        accessToken,
        body: JSON.stringify({
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: parseInt(sheetId),
                        dimension: 'ROWS',
                        startIndex,
                        endIndex
                    }
                }
            }]
        })
    });
};

export const createSheet = async (spreadsheetId, accessToken, name) => {
    const createResult = await request(`${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        accessToken,
        body: JSON.stringify({
            requests: [{
                addSheet: {
                    properties: { title: name }
                }
            }]
        })
    });

    const newSheetProps = createResult.replies[0].addSheet.properties;

    // Initialize Headers
    const headers = ['Date', 'Day', 'InTime', 'OutTime', 'Charges/ Day', 'Expenses', 'Kilometres', 'Location', 'Petrol (Rs. | Litres)'];
    await request(`${spreadsheetId}/values/${name}!A1:Z1?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        accessToken,
        body: JSON.stringify({ values: [headers] })
    });

    // Enforce Unique Dates validation in Column A
    await addUniqueDateValidation(spreadsheetId, newSheetProps.sheetId, accessToken);

    return newSheetProps;
};

export const addUniqueDateValidation = async (spreadsheetId, sheetId, accessToken) => {
    return request(`${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        accessToken,
        body: JSON.stringify({
            requests: [{
                setDataValidation: {
                    range: {
                        sheetId: parseInt(sheetId),
                        startRowIndex: 1, // Start from Row 2 (index 1)
                        startColumnIndex: 0, // Column A
                        endColumnIndex: 1
                    },
                    rule: {
                        condition: {
                            type: 'CUSTOM_FORMULA',
                            values: [{ userEnteredValue: '=COUNTIF($A:$A, A2)=1' }]
                        },
                        inputMessage: 'Date must be unique. An entry for this date already exists.',
                        strict: true,
                        showCustomUi: true
                    }
                }
            }]
        })
    });
};
