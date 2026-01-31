import React, { useState, useEffect } from 'react';
import { useGoogleSheets } from '../hooks/useGoogleSheets';

const TimeTracker = () => {
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
        appendRow,
        updateRow,
        deleteRow
    } = useGoogleSheets();

    // --- Helpers ---
    const getTodayLocal = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateForSheet = (isoDate) => {
        // Input: yyyy-mm-dd -> Output: dd-mm-yyyy
        if (!isoDate) return '';
        const [y, m, d] = isoDate.split('-');
        return `${d}-${m}-${y}`;
    };

    const parseDateFromSheet = (sheetDate) => {
        // Input: dd-mm-yyyy -> Output: yyyy-mm-dd
        // Also handle legacy colons just in case? Or just stick to new format.
        if (!sheetDate) return '';

        // Try dash first
        if (sheetDate.includes('-')) {
            const parts = sheetDate.split('-');
            if (parts.length !== 3) return sheetDate;
            const [d, m, y] = parts;
            return `${y}-${m}-${d}`;
        }

        // Fallback for previous colon format (optional, but good for UX if they edit old rows)
        if (sheetDate.includes(':')) {
            const parts = sheetDate.split(':');
            if (parts.length !== 3) return sheetDate;
            const [d, m, y] = parts;
            return `${y}-${m}-${d}`;
        }

        return sheetDate;
    };


    // --- State ---

    // Form State (Internal is yyyy-mm-dd for inputs, etc)
    const [formData, setFormData] = useState({
        date: getTodayLocal(),
        day: '',
        inTime: '12:00 PM', // Default per requirement
        outTime: '',
        charges: '909.0900909', // Default per requirement
        expenses: '',
        kilometres: '',
        location: '',
        petrol: 'no' // Default per requirement
    });

    const [editingId, setEditingId] = useState(null); // ID (index) of entry being edited
    const [viewingEntry, setViewingEntry] = useState(null); // Entry being viewed
    const [entries, setEntries] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // --- Effects ---

    // 1. Auto-auth
    useEffect(() => {
        if (credentials && spreadsheetId && !accessToken && !loading) {
            authenticate();
        }
    }, [credentials, spreadsheetId, accessToken, loading, authenticate]);

    // 2. Load Data on Auth
    useEffect(() => {
        if (accessToken) {
            loadData();
        }
    }, [accessToken]);

    // 3. Update 'Day' when 'Date' changes
    useEffect(() => {
        if (formData.date) {
            const dateObj = new Date(formData.date);
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = days[dateObj.getDay()];
            setFormData(prev => ({ ...prev, day: dayName }));
        }
    }, [formData.date]);


    // --- Actions ---

    const loadData = async () => {
        setIsRefreshing(true);
        const rows = await fetchRows();
        if (rows) {
            // Assuming Row 1 is headers.
            const mapped = rows.slice(1).map((r, i) => ({
                id: i,
                date: r[0] || '', // dd:mm:yyyy
                day: r[1] || '',
                inTime: r[2] || '',
                outTime: r[3] || '',
                charges: r[4] || '',
                expenses: r[5] || '',
                kilometres: r[6] || '',
                location: r[7] || '',
                petrol: r[8] || ''
            }));
            setEntries(mapped);
        }
        setIsRefreshing(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            date: getTodayLocal(),
            day: '', // Will update via useEffect
            inTime: '12:00 PM',
            outTime: '',
            charges: '909.0900909',
            expenses: '',
            kilometres: '',
            location: '',
            petrol: 'no'
        });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Prepare Row Data
            // Columns: [Date, Day, InTime, OutTime, Charges, Expenses, Kilometres, Location, Petrol]
            // Date needs formatting to dd:mm:yyyy
            const rowToSave = [
                formatDateForSheet(formData.date),
                formData.day,
                formData.inTime,
                formData.outTime,
                formData.charges,
                formData.expenses,
                formData.kilometres,
                formData.location,
                formData.petrol
            ];

            if (editingId !== null) {
                await updateRow(editingId, rowToSave);
            } else {
                await appendRow(rowToSave);
            }

            resetForm();
            loadData();
        } catch (err) {
            alert("Error saving: " + err.message);
        }
    };

    const handleEdit = (entry) => {
        setEditingId(entry.id);
        const isoDate = parseDateFromSheet(entry.date);

        setFormData({
            date: isoDate,
            day: entry.day,
            inTime: entry.inTime,
            outTime: entry.outTime,
            charges: entry.charges,
            expenses: entry.expenses,
            kilometres: entry.kilometres,
            location: entry.location,
            petrol: entry.petrol
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this entry?")) {
            try {
                await deleteRow(id);
                loadData();
            } catch (err) {
                alert("Error deleting: " + err.message);
            }
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
                alert("Invalid JSON");
            }
        };
        reader.readAsText(file);
    };

    // --- Views ---

    // 1. Initial State: Upload Credentials
    if (!credentials) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-200 font-sans selection:bg-indigo-500/30">
                <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20 mb-4">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome Back</h1>
                        <p className="text-zinc-500 text-sm">Upload your service account key to continue.</p>
                    </div>

                    <div className="relative group">
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            accept=".json"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="border border-dashed border-zinc-800 bg-zinc-900/50 rounded-xl p-8 text-center transition-all group-hover:border-zinc-700 group-hover:bg-zinc-900">
                            <div className="mx-auto w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            </div>
                            <span className="text-sm font-medium text-zinc-300">Click to upload credentials.json</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Login State: Helper to find Sheet ID
    if (!accessToken) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-zinc-200 font-sans">
                <div className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="space-y-1 text-center">
                        <h2 className="text-xl font-semibold text-white">Connect Sheet</h2>
                        <p className="text-xs text-zinc-500 font-mono bg-zinc-900 px-2 py-1 rounded inline-block border border-zinc-800 mx-auto">
                            {credentials.client_email}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Spreadsheet ID</label>
                            <input
                                value={spreadsheetId}
                                onChange={(e) => updateSpreadsheetId(e.target.value)}
                                placeholder="1BxiMVs0XRA5nFMdKbBdB..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-mono"
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                                {error}
                            </div>
                        )}

                        <button
                            onClick={authenticate}
                            disabled={loading || !spreadsheetId}
                            className="w-full bg-white text-black hover:bg-zinc-200 font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            Connect Workspace
                        </button>

                        <button onClick={logout} className="w-full text-xs text-zinc-500 hover:text-zinc-300 py-2">
                            Use different account
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Dashboard State
    return (
        <div className="h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-indigo-500/30 flex flex-col overflow-hidden">
            {/* Top Navigation */}
            <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md shrink-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="font-semibold text-white tracking-tight">TimeTracker</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {sheetName}
                        </div>
                        <button onClick={logout} className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">
                            Disconnect
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 overflow-y-auto lg:overflow-hidden relative">

                {/* View Modal */}
                {viewingEntry && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </div>
                                        Entry Details
                                    </h3>
                                    <button
                                        onClick={() => setViewingEntry(null)}
                                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Date & Day</label>
                                        <p className="text-lg text-white font-medium">{viewingEntry.date}</p>
                                        <p className="text-sm text-indigo-400">{viewingEntry.day}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Timing</label>
                                        <div className="flex gap-2 text-zinc-300">
                                            <span>In: <strong className="text-white">{viewingEntry.inTime}</strong></span>
                                            <span>•</span>
                                            <span>Out: <strong className="text-white">{viewingEntry.outTime || '-'}</strong></span>
                                        </div>
                                    </div>

                                    <div className="space-y-1 md:col-span-2 bg-zinc-800/50 p-4 rounded-xl border border-zinc-800">
                                        <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Descriptions & Notes</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-xs text-zinc-500 block mb-1">Expenses</span>
                                                <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{viewingEntry.expenses || 'None'}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-zinc-500 block mb-1">Location</span>
                                                <p className="text-sm text-white">{viewingEntry.location || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Financials</label>
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <span className="text-xs text-zinc-500 block">Charges</span>
                                                <p className="text-white font-mono">{viewingEntry.charges}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-zinc-500 block">Petrol</span>
                                                <p className="text-white">{viewingEntry.petrol}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Travel</label>
                                        <div>
                                            <span className="text-xs text-zinc-500 block">Kilometres</span>
                                            <p className="text-white font-mono">{viewingEntry.kilometres}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-4 border-t border-zinc-800 flex justify-end">
                                    <button
                                        onClick={() => setViewingEntry(null)}
                                        className="bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-white/5"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-full">

                    {/* Left Panel: Input Form */}
                    <div className="lg:col-span-4 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2 no-scrollbar">

                        {/* Input Form */}
                        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 shrink-0">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                                <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                                {editingId !== null ? 'Edit Entry' : 'New Entry'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                    {/* 1. Date */}
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            required
                                            className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white focus:ring-0 focus:border-indigo-500 transition-colors [color-scheme:dark]"
                                        />
                                        <label className="absolute left-0 -top-2.5 text-xs text-zinc-500">Date</label>
                                    </div>

                                    {/* 2. Day */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="day"
                                            value={formData.day}
                                            onChange={handleInputChange}
                                            placeholder="Day"
                                            className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                                        />
                                        <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                                            Day
                                        </label>
                                    </div>

                                    {/* 3. In Time */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="inTime"
                                            value={formData.inTime}
                                            onChange={handleInputChange}
                                            placeholder="12:00 PM"
                                            className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                                        />
                                        <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                                            In Time
                                        </label>
                                    </div>

                                    {/* 4. Out Time */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="outTime"
                                            value={formData.outTime}
                                            onChange={handleInputChange}
                                            placeholder="06:00 PM"
                                            className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                                        />
                                        <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                                            Out Time
                                        </label>
                                    </div>

                                    {/* 5. Charges */}
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="any"
                                            name="charges"
                                            value={formData.charges}
                                            onChange={handleInputChange}
                                            placeholder="909.09"
                                            className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                                        />
                                        <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                                            Charges
                                        </label>
                                    </div>

                                    {/* 6. Expenses */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="expenses"
                                            value={formData.expenses}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                                        />
                                        <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                                            Expenses
                                        </label>
                                    </div>

                                    {/* 7. Kilometres */}
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="any"
                                            name="kilometres"
                                            value={formData.kilometres}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                                        />
                                        <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                                            Kilometres
                                        </label>
                                    </div>

                                    {/* 8. Location */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="City"
                                            className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                                        />
                                        <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                                            Location
                                        </label>
                                    </div>

                                    {/* 9. Petrol */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="petrol"
                                            value={formData.petrol}
                                            onChange={handleInputChange}
                                            placeholder="no"
                                            className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                                        />
                                        <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                                            Petrol
                                        </label>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    {editingId !== null && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="w-1/3 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 py-3.5 rounded-xl font-bold transition-all"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-white text-black hover:bg-zinc-200 py-3.5 rounded-xl font-bold shadow-lg shadow-white/5 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                    >
                                        {loading ? 'Saving...' : (editingId !== null ? 'Update Entry' : 'Add Entry')}
                                        {!loading && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Panel: List */}
                    <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                History
                                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs text-zinc-400 font-medium border border-zinc-700">{entries.length}</span>
                            </h3>
                            <button
                                onClick={loadData}
                                className={`p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col">
                            <div className="overflow-x-auto lg:overflow-y-auto lg:flex-1 no-scrollbar">
                                <table className="w-full text-left relative">
                                    <thead className="bg-zinc-900/95 backdrop-blur border-b border-zinc-800 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                                            <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Day</th>
                                            <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">In</th>
                                            <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Out</th>
                                            <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Charges</th>
                                            <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Exp.</th>
                                            <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Km</th>
                                            <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Loc.</th>
                                            <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fuel</th>
                                            <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {entries.length === 0 ? (
                                            <tr>
                                                <td colSpan="10" className="px-6 py-16 text-center">
                                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 mb-4 opacity-50">
                                                        <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                    </div>
                                                    <p className="text-zinc-500 text-sm font-medium">No entries yet</p>
                                                    <p className="text-zinc-600 text-xs mt-1">Start by adding a new entry.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            entries.map((e) => (
                                                <tr key={e.id} className="group hover:bg-zinc-800/50 transition-colors">
                                                    <td className="px-4 py-4 text-sm text-zinc-400 font-mono whitespace-nowrap">{e.date}</td>
                                                    <td className="px-4 py-4 text-sm text-zinc-300">{e.day}</td>
                                                    <td className="px-4 py-4 text-sm text-zinc-400">{e.inTime}</td>
                                                    <td className="px-4 py-4 text-sm text-zinc-400">{e.outTime}</td>
                                                    <td className="px-4 py-4 text-sm text-zinc-400 font-mono">{e.charges}</td>
                                                    <td className="px-4 py-4 text-sm text-zinc-400 max-w-[150px] truncate" title={e.expenses}>{e.expenses}</td>
                                                    <td className="px-4 py-4 text-sm text-zinc-400 font-mono">{e.kilometres}</td>
                                                    <td className="px-4 py-4 text-sm text-zinc-400">{e.location}</td>
                                                    <td className="px-4 py-4 text-sm text-zinc-400">{e.petrol}</td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => setViewingEntry(e)}
                                                                className="p-1.5 rounded-md text-zinc-500 hover:text-teal-400 hover:bg-teal-500/10 transition-colors"
                                                                title="View Details"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(e)}
                                                                className="p-1.5 rounded-md text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(e.id)}
                                                                className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TimeTracker;
