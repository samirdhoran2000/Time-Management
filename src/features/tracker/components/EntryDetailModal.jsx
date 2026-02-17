import React from 'react';

const EntryDetailModal = ({ entry, onClose }) => {
    if (!entry) return null;

    // Parse petrol field (format: "quantity|rupees")
    const parsePetrol = (petrolValue) => {
        if (!petrolValue || petrolValue === '-' || petrolValue === 'N/A') {
            return { litres: '-', rupees: '-' };
        }
        const parts = petrolValue.split('|');
        return {
            litres: parts[0]?.trim() || '-',
            rupees: parts[1]?.trim() || '-'
        };
    };

    const petrolData = parsePetrol(entry.petrol);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-purple-500/10 animate-in fade-in zoom-in duration-300">
                <div className="p-4">
                    {/* Colorful Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Entry Details
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-pink-500/20 text-zinc-400 hover:text-white transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Colorful Content Grid */}
                    <div className="space-y-3">
                        {/* Date & Day Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-3 rounded-lg border border-purple-500/20">
                                <label className="text-xs text-purple-400 uppercase tracking-wide font-semibold flex items-center gap-1.5 mb-2">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Date & Day
                                </label>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                                        <svg className="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-white font-semibold text-sm">{entry.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-purple-400/10 px-2 py-1 rounded border border-purple-400/20">
                                        <svg className="w-3 h-3 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        <span className="text-purple-200 font-medium text-sm">{entry.day}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-3 rounded-lg border border-blue-500/20">
                                <label className="text-xs text-blue-400 uppercase tracking-wide font-semibold flex items-center gap-1.5 mb-2">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Time
                                </label>
                                <div className="text-sm space-y-1">
                                    <div className="flex items-center gap-1.5 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                                        <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                        <span className="text-green-400 font-medium">In:</span>
                                        <span className="text-white font-semibold">{entry.inTime}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                                        <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                        </svg>
                                        <span className="text-orange-400 font-medium">Out:</span>
                                        <span className="text-white font-semibold">{entry.outTime || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financials & Travel Section */}
                        <div className="bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-blue-500/5 p-3 rounded-lg border border-cyan-500/20">
                            <label className="text-xs text-cyan-400 uppercase tracking-wide font-semibold flex items-center gap-1.5 mb-2">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Financials & Travel
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1.5 rounded border border-emerald-500/20">
                                    <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs text-emerald-400 block">Charges</span>
                                        <span className="text-white font-mono font-bold text-sm truncate block">{entry.charges}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-blue-500/10 px-2 py-1.5 rounded border border-blue-500/20">
                                    <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs text-blue-400 block">Kilometres</span>
                                        <span className="text-white font-mono font-bold text-sm truncate block">{entry.kilometres}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-cyan-500/10 px-2 py-1.5 rounded border border-cyan-500/20">
                                    <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0a4 4 0 004 4h4a2 2 0 002-2v-5a2 2 0 00-2-2h-4a2 2 0 00-2 2v3z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs text-cyan-400 block">Litres</span>
                                        <span className="text-white font-semibold text-sm truncate block">{petrolData.litres}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-teal-500/10 px-2 py-1.5 rounded border border-teal-500/20">
                                    <svg className="w-3.5 h-3.5 text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs text-teal-400 block">Rupees</span>
                                        <span className="text-white font-mono font-semibold text-sm truncate block">₹{petrolData.rupees}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        {entry.location && entry.location !== '-' && (
                            <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 p-3 rounded-lg border border-green-500/20">
                                <label className="text-xs text-green-400 uppercase tracking-wide font-semibold flex items-center gap-1.5 mb-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Location
                                </label>
                                <p className="text-sm text-white font-medium">{entry.location}</p>
                            </div>
                        )}

                        {/* Expenses */}
                        {entry.expenses && entry.expenses !== 'None' && (
                            <div className="bg-gradient-to-br from-orange-500/10 to-amber-600/5 p-3 rounded-lg border border-orange-500/20">
                                <label className="text-xs text-orange-400 uppercase tracking-wide font-semibold flex items-center gap-1.5 mb-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    Expenses
                                </label>
                                <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{entry.expenses}</p>
                            </div>
                        )}
                    </div>

                    {/* Colorful Footer */}
                    <div className="mt-4 pt-3 border-t border-zinc-700/50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EntryDetailModal;
