import React, { useState, useEffect } from 'react';
import { useGoogleSheets } from '../hooks/useGoogleSheets';

const Home = () => {
    const {
        credentials,
        spreadsheetId,
        sheetName,
        accessToken,
        loading,
        error,
        saveCredentials,
        updateSpreadsheetId,
        authenticate,
        logout,
        fetchRows,
        appendRow
    } = useGoogleSheets();

    // Local state for UI
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({});

    // Auto-authenticate if credentials exist but no token yet
    useEffect(() => {
        if (credentials && spreadsheetId && !accessToken && !loading && !error) {
            // Optional: We can auto-auth here, or require a button click. 
            // For "second time dont ask", auto-auth is better UX, but might be aggressive.
            // Let's just allow the user to click "Connect" which is now pre-ready.
            // Or better: call authenticate() immediately if we have creds.
            authenticate();
        }
    }, [credentials, spreadsheetId, accessToken, loading, authenticate]); // Added dependencies

    // Fetch data once authenticated
    useEffect(() => {
        if (accessToken) {
            loadData();
        }
    }, [accessToken]);

    const loadData = async () => {
        const rows = await fetchRows();
        if (rows) {
            const headers = rows[0];
            const parsed = rows.slice(1).map((row, index) => {
                let obj = { id: index };
                headers.forEach((h, i) => obj[h] = row[i] || "");
                return obj;
            });
            setData(parsed);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                saveCredentials(json);
            } catch (err) {
                alert("Invalid JSON file");
            }
        };
        reader.readAsText(file);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (data.length === 0) return; // No headers known

        const headers = Object.keys(data[0]).filter(k => k !== 'id');
        const newRow = headers.map(h => formData[h] || "");

        try {
            await appendRow(newRow);
            setFormData({});
            loadData();
        } catch (e) {
            alert("Failed to append: " + e.message);
        }
    };

    // --- Render ---

    if (!credentials) {
        return (
            <div style={{ padding: '20px', maxWidth: '500px' }}>
                <h2>Welcome Back</h2>
                <p>Please upload your <code>credentials.json</code> to get started.</p>
                <input type="file" onChange={handleFileUpload} accept=".json" />
            </div>
        );
    }

    if (!accessToken) {
        return (
            <div style={{ padding: '20px' }}>
                <h2>Connect to Sheet</h2>
                <p>Credentials loaded for: {credentials.client_email}</p>

                <div style={{ marginBottom: '10px' }}>
                    <label>Spreadsheet ID: </label>
                    <input
                        value={spreadsheetId}
                        onChange={(e) => updateSpreadsheetId(e.target.value)}
                        placeholder="Enter ID"
                        style={{ width: '300px' }}
                    />
                </div>

                {error && <p style={{ color: 'red' }}>Error: {error}</p>}

                <button onClick={authenticate} disabled={loading || !spreadsheetId}>
                    {loading ? 'Authenticating...' : 'Connect'}
                </button>

                <br /><br />
                <button onClick={logout} style={{ fontSize: '0.8em' }}>Reset Credentials</button>
            </div>
        )
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Sheet Manager: {sheetName}</h2>
                <button onClick={logout}>Disconnect</button>
            </div>

            {loading && <p>Loading...</p>}

            {/* Create Form */}
            <form onSubmit={handleCreate} style={{ margin: '20px 0', border: '1px solid #ccc', padding: '10px' }}>
                <h3>Add New Entry</h3>
                {data.length > 0 ? (
                    Object.keys(data[0]).filter(k => k !== 'id').map(header => (
                        <input
                            key={header}
                            placeholder={header}
                            value={formData[header] || ''}
                            onChange={e => setFormData({ ...formData, [header]: e.target.value })}
                            style={{ marginRight: '10px', marginBottom: '10px' }}
                        />
                    ))
                ) : (
                    <p>No data found or empty sheet. Add headers to your sheet manually first.</p>
                )}
                <button type="submit" disabled={loading}>Add Row</button>
            </form>

            <button onClick={loadData}>Refresh Data</button>

            {/* Data Table */}
            <table border="1" style={{ marginTop: '20px', width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        {data.length > 0 && Object.keys(data[0]).filter(k => k !== 'id').map(h => <th key={h} style={{ padding: '8px' }}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i}>
                            {Object.keys(row).filter(k => k !== 'id').map((k, index) => <td key={index} style={{ padding: '8px' }}>{row[k]}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Home;