import React, { useState, useEffect } from 'react';
import * as jose from 'jose'; // To sign the JWT for Service Account auth

const GoogleSheetsCRUD = () => {
  // --- State for Credentials ---
  const [credentials, setCredentials] = useState(null);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [accessToken, setAccessToken] = useState(null);
  
  // --- State for Data ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  // 1. Handle JSON Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setCredentials(json);
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  // 2. Authenticate & Get Access Token (The "Node-replacement" logic)
  const getAccessToken = async () => {
    if (!credentials) return;
    setLoading(true);
    
    try {
      const { client_email, private_key } = credentials;
      
      // We must manually create a JWT for Google OAuth2 in the browser
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

      const tokenData = await response.json();
      setAccessToken(tokenData.access_token);
      alert("Authenticated successfully!");
    } catch (err) {
      console.error(err);
      alert("Auth failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. CRUD: Read Data
  const fetchData = async () => {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A:Z`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const result = await res.json();
    
    if (result.values) {
      const headers = result.values[0];
      const rows = result.values.slice(1).map((row, index) => {
        let obj = { id: index }; // Local ID for React keys
        headers.forEach((h, i) => obj[h] = row[i] || "");
        return obj;
      });
      setData(rows);
    }
  };

  // 4. CRUD: Create (Append)
  const handleCreate = async (e) => {
    e.preventDefault();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED`;
    
    // Convert formData object to a simple array based on existing headers
    const headers = Object.keys(data[0] || formData);
    const newRow = headers.map(h => formData[h] || "");

    await fetch(url, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: [newRow] })
    });
    fetchData(); // Refresh
  };

  // --- UI Layouts ---

  if (!accessToken) {
    return (
      <div style={{ padding: '20px', maxWidth: '500px' }}>
        <h2>Step 1: Setup Credentials</h2>
        <label>Upload credentials.json:</label>
        <input type="file" onChange={handleFileUpload} accept=".json" />
        <br /><br />
        <input 
          placeholder="Spreadsheet ID" 
          value={spreadsheetId} 
          onChange={e => setSpreadsheetId(e.target.value)} 
          style={{ width: '100%' }}
        />
        <br /><br />
        <button onClick={getAccessToken} disabled={!credentials || !spreadsheetId}>
          {loading ? 'Authenticating...' : 'Connect to Google Sheets'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Step 2: Sheet Management ({sheetName})</h2>
      
      {/* Create Form */}
      <form onSubmit={handleCreate} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h3>Add New Entry</h3>
        <input placeholder="Name" onChange={e => setFormData({...formData, Name: e.target.value})} />
        <input placeholder="Email" onChange={e => setFormData({...formData, Email: e.target.value})} />
        <button type="submit">Add Row</button>
      </form>

      <button onClick={fetchData}>Refresh Data</button>

      {/* Data Table */}
      <table border="1" style={{ marginTop: '20px', width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            {data.length > 0 && Object.keys(data[0]).map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((v, index) => <td key={index}>{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GoogleSheetsCRUD;