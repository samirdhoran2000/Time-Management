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
        allSheets,
        accessToken,
        loading,
        error,
        saveCredentials,
        updateSpreadsheetId,
        setSheetName,
        authenticate,
        logout,
        fetchRows,
        appendRow,
        updateRow,
        deleteRow,
        createSheet
    } = useGoogleSheets();

    // --- State ---

    // Form State (Internal is yyyy-mm-dd for inputs, etc)
    const [formData, setFormData] = useState({
        date: getTodayLocal(),
        day: getDayName(getTodayLocal()),
        inTime: '12:00 PM', // Default per requirement
        outTime: '',
        charges: '909', // Default per requirement
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
    const [isFormOpen, setIsFormOpen] = useState(false); // Mobile form visibility
    const [autoEntryNotification, setAutoEntryNotification] = useState(null); // Auto-entry notification
    const formRef = React.useRef(null);

    // --- Effects ---

    // 1. Auto-auth
    useEffect(() => {
        if (credentials && spreadsheetId && !accessToken && !loading) {
            authenticate();
        }
    }, [credentials, spreadsheetId, accessToken, loading, authenticate]);

    // 2. Load Data on Auth or Sheet Change
    useEffect(() => {
        if (accessToken && sheetName) {
            loadData();
        }
    }, [accessToken, sheetName]);

    // 3. Update 'Day' when 'Date' changes
    useEffect(() => {
        if (formData.date) {
            setFormData(prev => ({ ...prev, day: getDayName(formData.date) }));
        }
    }, [formData.date]);

    // 4. Clear state on disconnect
    useEffect(() => {
        if (!accessToken || !spreadsheetId) {
            setEntries([]);
            setEditingId(null);
        }
    }, [accessToken, spreadsheetId]);

    // 5. Auto-fill form if date already has an entry
    useEffect(() => {
        if (!formData.date || entries.length === 0) return;

        const formattedDate = formatDateForSheet(formData.date);
        const existingEntry = entries.find(e => e.date === formattedDate);

        if (existingEntry) {
            // Only auto-fill if we aren't already editing THIS entry or if we just changed the date
            if (editingId !== existingEntry.id) {
                setFormData(mapEntryToForm(existingEntry));
                setEditingId(existingEntry.id);
            }
        } else {
            // If date has no entry but we were in Edit Mode, reset to defaults
            if (editingId !== null) {
                const currentDate = formData.date;
                setFormData({
                    date: currentDate,
                    day: getDayName(currentDate),
                    inTime: '12:00 PM',
                    outTime: '',
                    charges: '909',
                    expenses: '',
                    kilometres: '',
                    location: '',
                    petrolAmount: '',
                    petrolLitres: ''
                });
                setEditingId(null);
            }
        }
    }, [formData.date, entries]);

    // 6. Auto-entry check: If user hasn't filled form for today by 12:00 PM, auto-enter with defaults
    useEffect(() => {
        // Only check if we have access to sheets and are not loading
        if (!accessToken || !entries || loading) return;

        const autoEntryCheck = async () => {
            const now = new Date();
            const todayLocal = getTodayLocal();
            const todayFormatted = formatDateForSheet(todayLocal);
            const hours = now.getHours();
            const minutes = now.getMinutes();

            // Check if it's 12:00 PM or within 1 hour after (12:00 PM to 1:00 PM window)
            const isAutoEntryTime = hours === 12 && minutes >= 0 && minutes < 60;

            if (!isAutoEntryTime) return; // Not auto-entry time yet

            // Check if today already has an entry
            const existingEntry = entries.find(e => e.date === todayFormatted);
            if (existingEntry) return; // Entry already exists, no need to auto-enter

            // No entry exists and it's auto-entry time, create default entry
            try {
                const defaultRow = [
                    todayFormatted,                      // Date
                    getDayName(todayLocal),         // Day
                    '12:00 PM',                    // In Time
                    '',                             // Out Time
                    '909',                           // Charges (default per requirement)
                    '',                             // Expenses
                    '',                             // Kilometres
                    '',                             // Location
                    'no'                            // Petrol
                ];

                await appendRow(defaultRow);

                // Show notification
                setAutoEntryNotification({
                    message: `Auto-entry created for ${todayFormatted} at 12:00 PM with default values`,
                    timestamp: new Date().toLocaleTimeString()
                });

                // Reload data to show new entry
                await loadData();

                // Auto-dismiss notification after 5 seconds
                setTimeout(() => {
                    setAutoEntryNotification(null);
                }, 5000);
            } catch (err) {
                console.error('Auto-entry failed:', err);
                // Don't show alert, just log it - user will see when they refresh
            }
        };

        // Set up interval to check every minute
        const intervalId = setInterval(autoEntryCheck, 60000); // 60 seconds

        // Initial check
        autoEntryCheck();

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [accessToken, entries, loading]);


    // --- Actions ---

    const mapEntryToForm = (entry) => {
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

        return {
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
        };
    };

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
            const loadedEntries = mapped.reverse();
            setEntries(loadedEntries);

            // Re-check current form date against newly loaded data
            const formattedCurrentDate = formatDateForSheet(formData.date);
            const match = loadedEntries.find(e => e.date === formattedCurrentDate);
            if (match && editingId === null) {
                setFormData(mapEntryToForm(match));
                setEditingId(match.id);
            }
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
            charges: '909',
            expenses: '',
            kilometres: '',
            location: '',
            petrolAmount: '',
            petrolLitres: ''
        });
        setEditingId(null);
        setIsFormOpen(false); // Close on cancel/reset
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

            const formattedDate = formatDateForSheet(formData.date);

            // Prepare Row Data
            // Columns: [Date, Day, InTime, OutTime, Charges, Expenses, Kilometres, Location, Petrol]
            const rowToSave = [
                formattedDate,
                formData.day,
                formData.inTime,
                formData.outTime,
                formData.charges,
                formData.expenses,
                formData.kilometres,
                formData.location,
                petrolValue
            ];

            // Check for duplicate date
            const existingEntry = entries.find(entry => entry.date === formattedDate);

            if (editingId === null && existingEntry) {
                const confirmed = window.confirm(
                    `An entry for ${formattedDate} already exists. Do you want to update the existing entry instead?`
                );
                if (!confirmed) return;

                // If confirmed, update the existing row instead of appending
                await updateRow(existingEntry.id, rowToSave);
            } else if (editingId !== null) {
                // Check if we're changing the date to another existing date (duplicate prevention on edit)
                const otherDuplicate = entries.find(entry => entry.date === formattedDate && entry.id !== editingId);
                if (otherDuplicate) {
                    const confirmed = window.confirm(
                        `Another entry for ${formattedDate} already exists. Do you want to overwrite it and update this entry?`
                    );
                    if (!confirmed) return;
                    // Note: This logic currently updates THIS edited row with the duplicate's date.
                    // To be truly clean, we might want to delete the otherDuplicate and update this one, 
                    // but for now, simple overwriting logic is safer.
                }
                await updateRow(editingId, rowToSave);
            } else {
                await appendRow(rowToSave);
            }

            resetForm();
            setIsFormOpen(false); // Close after successful save
            loadData();
        } catch (err) {
            alert("Error saving: " + err.message);
        }
    };

    const handleEdit = (entry) => {
        setEditingId(entry.id);
        setFormData(mapEntryToForm(entry));
        setIsFormOpen(true); // Open form on edit

        // Scroll to form on mobile
        if (window.innerWidth < 1024 && formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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

    const handleAddSheet = async () => {
        const name = prompt("Enter new sheet name (e.g., February 2026):");
        if (name && name.trim()) {
            try {
                await createSheet(name.trim());
                // Data will reload via useEffect[sheetName]
            } catch (err) {
                alert("Error creating sheet: " + err.message);
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
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="font-semibold text-white tracking-tight hidden sm:block">TimeTracker</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <select
                                value={sheetName}
                                onChange={(e) => setSheetName(e.target.value)}
                                className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 sm:px-3 text-[10px] sm:text-xs font-medium text-zinc-300 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer max-w-[100px] sm:max-w-none"
                            >
                                {allSheets.map(s => (
                                    <option key={s.sheetId} value={s.title}>{s.title}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddSheet}
                                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all shadow-sm shrink-0"
                                title="Add New Sheet"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                        <button onClick={logout} className="text-[10px] sm:text-sm font-medium text-zinc-500 hover:text-white transition-colors shrink-0">
                            Disconnect
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 overflow-y-auto lg:overflow-hidden relative">

                {/* Auto-entry Notification */}
                {autoEntryNotification && (
                    <div className="fixed top-20 right-6 z-[70] max-w-md bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right-4 fade-in duration-300 flex items-start gap-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.5" />
                        </svg>
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{autoEntryNotification.message}</p>
                            <p className="text-xs text-indigo-100 mt-1">{autoEntryNotification.timestamp}</p>
                        </div>
                        <button
                            onClick={() => setAutoEntryNotification(null)}
                            className="text-indigo-100 hover:text-white transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* View Modal */}
                <EntryDetailModal
                    entry={viewingEntry}
                    onClose={() => setViewingEntry(null)}
                />

                {/* Floating Action Button (Mobile Only) */}
                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="lg:hidden fixed bottom-8 right-6 z-[60] w-14 h-14 rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 flex items-center justify-center transition-all active:scale-95 hover:bg-indigo-500"
                >
                    {isFormOpen ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    )}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-full">

                    {/* Left Panel: Input Form */}
                    <div
                        ref={formRef}
                        className={`
                            fixed inset-0 z-[55] bg-zinc-950/95 backdrop-blur-sm lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:backdrop-blur-none
                            lg:col-span-4 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2 no-scrollbar scroll-mt-20 p-6 lg:p-0
                            overflow-y-auto h-[100dvh] lg:h-auto pb-20 lg:pb-0
                            transition-all duration-300 ease-in-out
                            ${isFormOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 lg:translate-y-0 lg:opacity-100'}
                        `}
                    >
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
