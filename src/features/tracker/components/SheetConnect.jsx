import React from 'react';

const SheetConnect = ({
    credentials,
    spreadsheetId,
    onUpdateId,
    onConnect,
    loading,
    error,
    onLogout
}) => {
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
                            onChange={(e) => onUpdateId(e.target.value)}
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
                        onClick={onConnect}
                        disabled={loading || !spreadsheetId}
                        className="w-full bg-white text-black hover:bg-zinc-200 font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        Connect Workspace
                    </button>

                    <button onClick={onLogout} className="w-full text-xs text-zinc-500 hover:text-zinc-300 py-2">
                        Use different account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SheetConnect;
