import React, { useState, useEffect } from 'react';
import FormField from './FormField';

const TrackerForm = ({ formData, onChange, onSubmit, loading, editingId, onCancel, minDate, maxDate }) => {
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
                    <FormField
                        label="Date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={onChange}
                        min={minDate}
                        max={maxDate}
                        required
                    />

                    <FormField
                        label="Day"
                        name="day"
                        value={formData.day}
                        onChange={onChange}
                        disabled
                    />

                    <FormField
                        label="In Time"
                        name="inTime"
                        type="time"
                        value={formData.inTime}
                        onChange={onChange}
                        placeholder="12:00 PM"
                    />

                    <FormField
                        label="Out Time"
                        name="outTime"
                        type="time"
                        value={formData.outTime}
                        onChange={onChange}
                        placeholder="06:00 PM"
                    />

                    <FormField
                        label="Charges"
                        name="charges"
                        type="number"
                        step="any"
                        value={formData.charges}
                        onChange={onChange}
                        placeholder="909.09"
                    />

                    <FormField
                        label="Kilometres"
                        name="kilometres"
                        type="number"
                        step="any"
                        value={formData.kilometres}
                        onChange={onChange}
                        placeholder="0"
                    />

                    <div className="relative group sm:col-span-2 space-y-2">
                        <FormField
                            label="Location"
                            name="location"
                            value={formData.location}
                            onChange={onChange}
                            placeholder="Location"
                        />

                        {/* Quick Add Presets */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {['F8', 'Office', 'Local', 'D-Mart', 'Pune Station'].map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => {
                                        const currentVal = formData.location || '';
                                        const trimmed = currentVal.trim();
                                        const newVal = trimmed ? `${trimmed} + ${preset}` : preset;
                                        onChange({ target: { name: 'location', value: newVal } });
                                    }}
                                    className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/30 transition-all active:scale-95"
                                >
                                    + {preset}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    const custom = prompt('Enter custom location:');
                                    if (custom && custom.trim()) {
                                        const currentVal = formData.location || '';
                                        const trimmed = currentVal.trim();
                                        const newVal = trimmed ? `${trimmed} + ${custom.trim()}` : custom.trim();
                                        onChange({ target: { name: 'location', value: newVal } });
                                    }
                                }}
                                className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-all active:scale-95"
                            >
                                Custom
                            </button>
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
                        <FormField
                            label="Expenses"
                            name="expenses"
                            value={formData.expenses}
                            onChange={onChange}
                            placeholder="0"
                        />

                        {/* Petrol Group */}
                        <div className="flex items-end gap-3">
                            <FormField
                                label="Petrol (₹)"
                                name="petrolAmount"
                                type="number"
                                step="any"
                                value={formData.petrolAmount || ''}
                                onChange={onChange}
                                placeholder="Amount"
                                className="flex-1"
                            />

                            <div className="pb-3 text-zinc-600 font-light">/</div>

                            <FormField
                                label="Litres (L)"
                                name="petrolLitres"
                                type="number"
                                step="any"
                                value={formData.petrolLitres || ''}
                                onChange={onChange}
                                placeholder="Litres"
                                className="flex-1"
                            />
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4 pb-4">
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
