import React from 'react';

const EntryDetailModal = ({ entry, onClose }) => {
    if (!entry) return null;

    return (
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
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Date & Day</label>
                            <p className="text-lg text-white font-medium">{entry.date}</p>
                            <p className="text-sm text-indigo-400">{entry.day}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Timing</label>
                            <div className="flex gap-2 text-zinc-300">
                                <span>In: <strong className="text-white">{entry.inTime}</strong></span>
                                <span>•</span>
                                <span>Out: <strong className="text-white">{entry.outTime || '-'}</strong></span>
                            </div>
                        </div>

                        <div className="space-y-1 md:col-span-2 bg-zinc-800/50 p-4 rounded-xl border border-zinc-800">
                            <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Descriptions & Notes</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Expenses</span>
                                    <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{entry.expenses || 'None'}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-500 block mb-1">Location</span>
                                    <p className="text-sm text-white">{entry.location || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Financials</label>
                            <div className="flex items-center gap-4">
                                <div>
                                    <span className="text-xs text-zinc-500 block">Charges</span>
                                    <p className="text-white font-mono">{entry.charges}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-zinc-500 block">Petrol</span>
                                    <p className="text-white">{entry.petrol}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Travel</label>
                            <div>
                                <span className="text-xs text-zinc-500 block">Kilometres</span>
                                <p className="text-white font-mono">{entry.kilometres}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-zinc-800 flex justify-end">
                        <button
                            onClick={onClose}
                            className="bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-white/5"
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
