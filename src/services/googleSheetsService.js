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
    // We append starting from Column B, same as updateRow, because Column A is intentionally left blank.
    // If we start at Column A, Google Sheets append considers the rows empty and overwrites Row 1.
    const dataToWrite = rowArray.slice(1);
    const response = await request(`${spreadsheetId}/values/${sheetName}!B1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        accessToken,
        body: JSON.stringify({ values: [dataToWrite] })
    });
    return response.updates; // Returns { spreadsheetId, updatedRange, updatedRows... }
};

export const updateRow = async (spreadsheetId, sheetName, accessToken, rowIndex, rowArray) => {
    // UI index 0 -> Sheet Row 2
    // We update starting from Column B, avoiding any overwrites on Column A
    const range = `${sheetName}!B${rowIndex + 2}`;
    const dataToWrite = rowArray.slice(1);
    const response = await request(`${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        accessToken,
        body: JSON.stringify({ values: [dataToWrite] })
    });
    return response; // Returns { spreadsheetId, updatedRange, updatedRows... }
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

export const setRowMergeAndFormat = async (spreadsheetId, sheetId, accessToken, rowIndex, shouldMerge) => {
    // rowIndex comes in as the 0-based index from UI (0 -> row 2)
    const startRowIndex = rowIndex + 1; // 0-based for API -> 1
    const endRowIndex = startRowIndex + 1;
    
    // Columns D to J -> Start Index 3, End Index 10
    const startColumnIndex = 3;
    const endColumnIndex = 10;
    
    const requests = [];

    if (shouldMerge) {
        // Merge columns D-J
        requests.push({
            mergeCells: {
                mergeType: 'MERGE_ALL',
                range: {
                    sheetId: parseInt(sheetId),
                    startRowIndex,
                    endRowIndex,
                    startColumnIndex,
                    endColumnIndex
                }
            }
        });
        
        // Add centered formatting and a subtle background color for holidays
        requests.push({
            repeatCell: {
                range: {
                    sheetId: parseInt(sheetId),
                    startRowIndex,
                    endRowIndex,
                    startColumnIndex,
                    endColumnIndex
                },
                cell: {
                    userEnteredFormat: {
                        horizontalAlignment: 'CENTER',
                        textFormat: {
                            bold: true,
                            foregroundColor: { red: 0.2, green: 0.6, blue: 0.3 }
                        },
                        backgroundColor: { red: 0.9, green: 0.98, blue: 0.9 }
                    }
                },
                fields: 'userEnteredFormat(horizontalAlignment,textFormat,backgroundColor)'
            }
        });
    } else {
        // Unmerge
        requests.push({
            unmergeCells: {
                range: {
                    sheetId: parseInt(sheetId),
                    startRowIndex,
                    endRowIndex,
                    startColumnIndex,
                    endColumnIndex
                }
            }
        });
        
        // Reset default formatting (clear backgrounds, standard text)
        requests.push({
            repeatCell: {
                range: {
                    sheetId: parseInt(sheetId),
                    startRowIndex,
                    endRowIndex,
                    startColumnIndex,
                    endColumnIndex
                },
                cell: {
                    userEnteredFormat: {
                        horizontalAlignment: 'LEFT',
                        textFormat: { bold: false, foregroundColor: { red: 0, green: 0, blue: 0 } },
                        backgroundColor: { red: 1, green: 1, blue: 1 }
                    }
                },
                fields: 'userEnteredFormat(horizontalAlignment,textFormat,backgroundColor)'
            }
        });
    }

    return request(`${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        accessToken,
        body: JSON.stringify({ requests })
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
    const headers = ['', 'Date', 'Day', 'InTime', 'OutTime', 'Charges/ Day', 'Expenses', 'Kilometres', 'Location', 'Petrol (Rs. | Litres)'];
    await request(`${spreadsheetId}/values/${name}!A1:Z1?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        accessToken,
        body: JSON.stringify({ values: [headers] })
    });

    // Enforce Unique Dates validation in Column A
    await addUniqueDateValidation(spreadsheetId, newSheetProps.sheetId, accessToken);

    return newSheetProps;
};

export const moveRow = async (spreadsheetId, sheetId, accessToken, sourceRowIndex, destinationRowIndex) => {
    // sourceRowIndex: 0-based index of row to move (UI 0 -> Sheet Row 2 -> API 1)
    // destinationRowIndex: 0-based index of the destination (API)
    
    return request(`${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        accessToken,
        body: JSON.stringify({
            requests: [{
                moveDimension: {
                    source: {
                        sheetId: parseInt(sheetId),
                        dimension: 'ROWS',
                        startIndex: sourceRowIndex + 1,
                        endIndex: sourceRowIndex + 2
                    },
                    destinationIndex: destinationRowIndex + 1
                }
            }]
        })
    });
};

export const updateValueRange = async (spreadsheetId, sheetName, accessToken, range, values) => {
    return request(`${spreadsheetId}/values/${sheetName}!${range}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        accessToken,
        body: JSON.stringify({ values })
    });
};

export const addUniqueDateValidation = async (spreadsheetId, sheetId, accessToken) => {
    // ... existed before ...
    return request(`${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        accessToken,
        body: JSON.stringify({
            requests: [{
                setDataValidation: {
                    range: {
                        sheetId: parseInt(sheetId),
                        startRowIndex: 1, // Start from Row 2 (index 1)
                        startColumnIndex: 1, // Column B
                        endColumnIndex: 2
                    },
                    rule: {
                        condition: {
                            type: 'CUSTOM_FORMULA',
                            values: [{ userEnteredValue: '=COUNTIF($B:$B, B2)=1' }]
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
