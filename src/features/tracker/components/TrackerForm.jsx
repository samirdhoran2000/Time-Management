import React, { useState, useEffect } from 'react';

const TrackerForm = ({ formData, onChange, onSubmit, loading, editingId, onCancel }) => {
    const [showExtras, setShowExtras] = useState(false);

    // Auto-expand if Expenses or Petrol has data (e.g. on Edit)
    useEffect(() => {
        if (formData.expenses || formData.petrolAmount || formData.petrolLitres) {
            setShowExtras(true);
        }
    }, [formData.expenses, formData.petrolAmount, formData.petrolLitres, editingId]);

    return (
        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 shrink-0">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                {editingId !== null ? 'Edit Entry' : 'New Entry'}
            </h3>

            <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* 1. Date */}
                    <div className="relative">
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={onChange}
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
                            onChange={onChange}
                            placeholder="Day"
                            disabled
                            className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors cursor-not-allowed"
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
                            onChange={onChange}
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
                            onChange={onChange}
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
                            onChange={onChange}
                            placeholder="909.09"
                            className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                        />
                        <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                            Charges
                        </label>
                    </div>

                    {/* 7. Kilometres (Moved up as it's default) */}
                    <div className="relative">
                        <input
                            type="number"
                            step="any"
                            name="kilometres"
                            value={formData.kilometres}
                            onChange={onChange}
                            placeholder="0"
                            className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                        />
                        <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                            Kilometres
                        </label>
                    </div>

                    {/* 8. Location */}
                    <div className="relative group sm:col-span-2">
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={onChange}
                            placeholder="Location"
                            className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                        />
                        <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                            Location
                        </label>

                        {/* Quick Add Presets */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {['F8', 'Office', 'Local'].map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => {
                                        const currentVal = formData.location || '';
                                        const trimmed = currentVal.trim();
                                        const newVal = trimmed ? `${trimmed}, ${preset}` : preset;
                                        onChange({ target: { name: 'location', value: newVal } });
                                    }}
                                    className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/30 transition-all active:scale-95"
                                >
                                    + {preset}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => onChange({ target: { name: 'location', value: '' } })}
                                className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-zinc-900/50 text-zinc-600 border border-zinc-800/50 hover:text-red-400/70 transition-all"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Extras Toggle */}
                <div>
                    {!showExtras ? (
                        <button
                            type="button"
                            onClick={() => setShowExtras(true)}
                            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Add Expenses & Fuel
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowExtras(false)}
                            className="text-xs font-medium text-zinc-500 hover:text-zinc-400 flex items-center gap-1 mb-4 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                            Hide Extras
                        </button>
                    )}
                </div>

                {/* Extras Section */}
                {showExtras && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in slide-in-from-top-2 fade-in duration-300">
                        {/* 6. Expenses */}
                        <div className="relative">
                            <input
                                type="text"
                                name="expenses"
                                value={formData.expenses}
                                onChange={onChange}
                                placeholder="0"
                                className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                            />
                            <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                                Expenses
                            </label>
                        </div>

                        {/* 9. Petrol Group */}
                        <div className="flex items-end gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    name="petrolAmount"
                                    value={formData.petrolAmount || ''}
                                    onChange={onChange}
                                    step="any"
                                    placeholder="Amount"
                                    className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                                />
                                <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 pointer-events-none transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                                    Petrol (₹)
                                </label>
                            </div>

                            <div className="pb-3 text-zinc-600 font-light">/</div>

                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    name="petrolLitres"
                                    value={formData.petrolLitres || ''}
                                    onChange={onChange}
                                    step="any"
                                    placeholder="Litres"
                                    className="peer w-full bg-transparent border-0 border-b border-zinc-700 px-0 py-2.5 text-white placeholder-transparent focus:ring-0 focus:border-indigo-500 transition-colors"
                                />
                                <label className="absolute left-0 -top-2.5 text-xs text-zinc-500 pointer-events-none transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-500">
                                    Litres (L)
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                    {editingId !== null && (
                        <button
                            type="button"
                            onClick={onCancel}
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
    );
};

export default TrackerForm;
