import React, { useState, useEffect } from 'react';
import { useGoogleSheets } from '../hooks/useGoogleSheets';
import { getTodayLocal, formatDateForSheet, parseDateFromSheet, getDayName } from '../features/tracker/utils/dateUtils';

// Modular Components
import CredentialsUpload from '../features/tracker/components/CredentialsUpload';
import SheetConnect from '../features/tracker/components/SheetConnect';
import TrackerForm from '../features/tracker/components/TrackerForm';
import TrackerHistory from '../features/tracker/components/TrackerHistory';
import EntryDetailModal from '../features/tracker/components/EntryDetailModal';
import TrackerStats from '../features/tracker/components/TrackerStats';

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

    // --- State ---

    // Form State (Internal is yyyy-mm-dd for inputs, etc)
    const [formData, setFormData] = useState({
        date: getTodayLocal(),
        day: getDayName(getTodayLocal()),
        inTime: '12:00 PM', // Default per requirement
        outTime: '',
        charges: '909.0900909', // Default per requirement
        expenses: '',
        kilometres: '',
        location: '',
        petrolAmount: '',
        petrolLitres: ''
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
            setFormData(prev => ({ ...prev, day: getDayName(formData.date) }));
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
                date: r[0] || '', // dd-mm-yyyy
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
        const today = getTodayLocal();
        setFormData({
            date: today,
            day: getDayName(today),
            inTime: '12:00 PM',
            outTime: '',
            charges: '909.0900909',
            expenses: '',
            kilometres: '',
            location: '',
            petrolAmount: '',
            petrolLitres: ''
        });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Prepare Petrol Composite
            let petrolValue = 'no';
            if (formData.petrolAmount && formData.petrolLitres) {
                petrolValue = `${formData.petrolAmount} | ${formData.petrolLitres}`;
            } else if (formData.petrolAmount) {
                petrolValue = `${formData.petrolAmount} | -`;
            }

            // Prepare Row Data
            // Columns: [Date, Day, InTime, OutTime, Charges, Expenses, Kilometres, Location, Petrol]
            const rowToSave = [
                formatDateForSheet(formData.date),
                formData.day,
                formData.inTime,
                formData.outTime,
                formData.charges,
                formData.expenses,
                formData.kilometres,
                formData.location,
                petrolValue
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

        // Parse Petrol
        let pAmount = '';
        let pLitres = '';
        if (entry.petrol && entry.petrol !== 'no') {
            const parts = entry.petrol.split('|');
            if (parts.length >= 1) pAmount = parts[0].trim();
            if (parts.length >= 2) pLitres = parts[1].trim();
            if (pLitres === '-') pLitres = '';
        }

        setFormData({
            date: isoDate,
            day: entry.day,
            inTime: entry.inTime,
            outTime: entry.outTime,
            charges: entry.charges,
            expenses: entry.expenses,
            kilometres: entry.kilometres,
            location: entry.location,
            petrolAmount: pAmount,
            petrolLitres: pLitres
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

    // --- Views ---

    // 1. Initial State: Upload Credentials
    if (!credentials) {
        return <CredentialsUpload onUpload={saveCredentials} />;
    }

    // 2. Login State: Helper to find Sheet ID
    if (!accessToken) {
        return (
            <SheetConnect
                credentials={credentials}
                spreadsheetId={spreadsheetId}
                onUpdateId={updateSpreadsheetId}
                onConnect={authenticate}
                loading={loading}
                error={error}
                onLogout={logout}
            />
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
                <EntryDetailModal
                    entry={viewingEntry}
                    onClose={() => setViewingEntry(null)}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-full">

                    {/* Left Panel: Input Form */}
                    <div className="lg:col-span-4 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2 no-scrollbar">
                        <TrackerForm
                            formData={formData}
                            onChange={handleInputChange}
                            onSubmit={handleSubmit}
                            loading={loading}
                            editingId={editingId}
                            onCancel={resetForm}
                        />
                    </div>

                    {/* Right Panel: List & Stats */}
                    <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
                        <TrackerStats entries={entries} />

                        <TrackerHistory
                            entries={entries}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={setViewingEntry}
                            isRefreshing={isRefreshing}
                            onRefresh={loadData}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TimeTracker;
