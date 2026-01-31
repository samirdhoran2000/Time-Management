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
        appendRow
    } = useGoogleSheets();

    // Schema: Task Name, Date, Duration, Status
    const [taskName, setTaskName] = useState('');
    const [duration, setDuration] = useState('');
    const [status, setStatus] = useState('Pending');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const [entries, setEntries] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Auto-auth
    useEffect(() => {
        if (credentials && spreadsheetId && !accessToken && !loading) {
            authenticate();
        }
    }, [credentials, spreadsheetId, accessToken, loading, authenticate]);

    // Load Data
    useEffect(() => {
        if (accessToken) {
            loadData();
        }
    }, [accessToken]);

    const loadData = async () => {
        setIsRefreshing(true);
        const rows = await fetchRows();
        if (rows) {
            // Assuming Row 1 is headers: Task, Date, Duration, Status
            // We map the rest
            const mapped = rows.slice(1).map((r, i) => ({
                id: i,
                task: r[0],
                date: r[1],
                duration: r[2],
                status: r[3]
            }));
            setEntries(mapped);
        }
        setIsRefreshing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Append row: [Task, Date, Duration, Status]
            await appendRow([taskName, date, duration, status]);
            // Clear form
            setTaskName('');
            setDuration('');
            setStatus('Pending');
            // Reload
            loadData();
        } catch (err) {
            alert("Error adding task: " + err.message);
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

    // Calculate stats
    const totalHours = entries.reduce((acc, curr) => {
        const d = parseFloat(curr.duration) || 0;
        return acc + d;
    }, 0);

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'done': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'in progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
        }
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

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 overflow-y-auto lg:overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-full">

                    {/* Left Panel: Stats & Input */}
                    <div className="lg:col-span-4 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2 no-scrollbar">
                        {/* Summary Card */}
                        <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-3 sm:p-8 group shadow-2xl shadow-indigo-500/5 shrink-0">
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            </div>

                            <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">Total Logged</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl sm:text-6xl font-bold text-white tracking-tight">{totalHours}</span>
                                <span className="text-xl text-zinc-500 font-medium">hrs</span>
                            </div>
                            <div className="mt-6 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-2/3 rounded-full"></div>
                            </div>
                        </div>

                        {/* Input Form */}
                        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 shrink-0">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                                <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                                New Entry
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <input
                                            value={taskName}
                                            onChange={e => setTaskName(e.target.value)}
                                            required
                                            placeholder="What are you working on?"
                                            className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-3 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                                        />
                                        <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                                            Task Description
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={duration}
                                                onChange={e => setDuration(e.target.value)}
                                                required
                                                placeholder="0.0"
                                                className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-3 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                                            />
                                            <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                                                Duration (h)
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={date}
                                                onChange={e => setDate(e.target.value)}
                                                required
                                                className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-3 text-white focus:ring-0 focus:border-indigo-500 transition-colors [color-scheme:dark]"
                                            />
                                            <label className="absolute left-0 -top-2.5 text-xs text-zinc-500">Date</label>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Status</label>
                                        <div className="flex gap-2">
                                            {['Pending', 'In Progress', 'Done'].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setStatus(s)}
                                                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${status === s
                                                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/25'
                                                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-white text-black hover:bg-zinc-200 py-3.5 rounded-xl font-bold shadow-lg shadow-white/5 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-4"
                                >
                                    {loading ? 'Saving...' : 'Add Entry'}
                                    {!loading && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
                                </button>
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
                                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider w-1/2">Task</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Dur.</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {entries.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-16 text-center">
                                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 mb-4 opacity-50">
                                                        <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                    </div>
                                                    <p className="text-zinc-500 text-sm font-medium">No activity yet</p>
                                                    <p className="text-zinc-600 text-xs mt-1">Your logged tasks will appear here.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            entries.map((e) => (
                                                <tr key={e.id} className="group hover:bg-zinc-800/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-zinc-400 font-mono whitespace-nowrap">{e.date}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{e.task}</td>
                                                    <td className="px-6 py-4 text-sm text-zinc-400 font-mono text-right">{e.duration}h</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(e.status)}`}>
                                                            {e.status}
                                                        </span>
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
