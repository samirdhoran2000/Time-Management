import React, { useState, useEffect, useRef } from 'react';
import FormField from './FormField';
import ExpenseBuilder from './ExpenseBuilder';

const TrackerForm = ({ formData, onChange, setFormData, onSubmit, loading, editingId, onCancel, minDate, maxDate }) => {
    const [showExtras, setShowExtras] = useState(false);
    const locationRef = useRef(null);

    // Auto-expand if Expenses or Petrol has data (e.g. on Edit)
    useEffect(() => {
        if (formData.expenses || formData.petrolAmount || formData.petrolLitres) {
            setShowExtras(true);
        }
    }, [formData.expenses, formData.petrolAmount, formData.petrolLitres, editingId]);

    return (
        <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50 shrink-0">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <span className={`w-1 h-5 rounded-full ${formData.isHoliday ? 'bg-emerald-500' : 'bg-indigo-500'}`}></span>
                {editingId !== null ? 'Edit Entry' : 'New Entry'}
            </h3>
            
            {/* Tabs */}
            <div className="flex bg-zinc-800/50 p-1 rounded-xl mb-5 space-x-1">
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isHoliday: false }))}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!formData.isHoliday ? 'bg-indigo-500 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'}`}
                >
                    Regular Entry
                </button>
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isHoliday: true }))}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formData.isHoliday ? 'bg-emerald-500 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50'}`}
                >
                    Holiday
                </button>
            </div>

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
                    
                    {formData.isHoliday ? (
                        <div className="sm:col-span-2 slide-in-from-top-2 animate-in fade-in duration-300">
                             <FormField
                                 label="Holiday Name / Description"
                                 name="holidayName"
                                 value={formData.holidayName}
                                 onChange={onChange}
                                 placeholder="e.g. Diwali, Public Holiday, Sick Leave..."
                                 required
                             />
                        </div>
                    ) : (
                        <>
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
                                    inputRef={locationRef}
                                />

                                {/* Quick Add Presets */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {['F8', 'Office', 'Local', 'D-Mart', 'Pune Station', 'Gulmohar'].map(preset => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => {
                                                const currentVal = formData.location || '';
                                                const trimmed = currentVal.trim();
                                                const newVal = trimmed ? `${trimmed} + ${preset}` : preset;
                                                onChange({ target: { name: 'location', value: newVal } });

                                                // Focus and scroll to end
                                                setTimeout(() => {
                                                    if (locationRef.current) {
                                                        locationRef.current.focus();
                                                        locationRef.current.scrollLeft = locationRef.current.scrollWidth;
                                                        const len = newVal.length;
                                                        locationRef.current.setSelectionRange(len, len);
                                                    }
                                                }, 0);
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

                                                // Focus and scroll to end
                                                setTimeout(() => {
                                                    if (locationRef.current) {
                                                        locationRef.current.focus();
                                                        locationRef.current.scrollLeft = locationRef.current.scrollWidth;
                                                        const len = newVal.length;
                                                        locationRef.current.setSelectionRange(len, len);
                                                    }
                                                }, 0);
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
                        </>
                    )}
                </div>

                {/* Extras Toggle - Only in Regular Entry */}
                {!formData.isHoliday && (
                    <>
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
                                <ExpenseBuilder
                                    value={formData.expenses}
                                    onChange={onChange}
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
                    </>
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
                        className={`flex-1 text-black py-3.5 rounded-xl font-bold shadow-lg shadow-white/5 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 ${formData.isHoliday ? 'bg-emerald-400 hover:bg-emerald-300' : 'bg-white hover:bg-zinc-200'}`}
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
