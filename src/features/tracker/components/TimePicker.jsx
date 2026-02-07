import React, { useState, useEffect, useRef } from 'react';

/**
 * Custom Time Picker Component
 * Provides a dropdown interface to select Hour, Minute, and AM/PM.
 */
const TimePicker = ({ value, onChange, label, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Parse current value (Expect format: "HH:MM AM/PM" or similar)
    const parseTime = (timeStr) => {
        const defaultTime = { hour: '12', minute: '00', period: 'PM' };
        if (!timeStr) return defaultTime;

        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return defaultTime;

        return {
            hour: match[1],
            minute: match[2],
            period: match[3].toUpperCase()
        };
    };

    const [currentTime, setCurrentTime] = useState(parseTime(value));

    useEffect(() => {
        setCurrentTime(parseTime(value));
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (type, val) => {
        const newTime = { ...currentTime, [type]: val };
        setCurrentTime(newTime);
        const timeString = `${newTime.hour}:${newTime.minute} ${newTime.period}`;
        onChange(timeString);
    };

    const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')); // 5-minute increments

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-zinc-900/30 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-left flex items-center justify-between transition-all hover:bg-zinc-800/50 hover:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <span className={value ? 'text-white' : 'text-zinc-500'}>
                    {value || 'Select Time'}
                </span>
                <svg className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-[280px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200"
                    >
                        <div className="text-center mb-6">
                            <h4 className="text-sm font-semibold text-white">{label || 'Select Time'}</h4>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {/* Hours */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center block">Hour</label>
                                <div className="h-48 overflow-y-auto no-scrollbar space-y-1 px-1">
                                    {hours.map(h => (
                                        <button
                                            key={h}
                                            type="button"
                                            onClick={() => handleSelect('hour', h)}
                                            className={`w-full py-2 text-sm rounded-lg transition-all ${currentTime.hour === h ? 'bg-indigo-600 text-white font-bold' : 'text-zinc-400 hover:bg-zinc-800'}`}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Minutes */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center block">Min</label>
                                <div className="h-48 overflow-y-auto no-scrollbar space-y-1 px-1">
                                    {minutes.map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => handleSelect('minute', m)}
                                            className={`w-full py-2 text-sm rounded-lg transition-all ${currentTime.minute === m ? 'bg-indigo-600 text-white font-bold' : 'text-zinc-400 hover:bg-zinc-800'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* AM/PM */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center block">Period</label>
                                <div className="flex flex-col gap-2">
                                    {['AM', 'PM'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => handleSelect('period', p)}
                                            className={`w-full py-3 text-sm rounded-lg transition-all ${currentTime.period === p ? 'bg-indigo-600 text-white font-bold' : 'text-zinc-400 hover:bg-zinc-800'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-full bg-white text-black hover:bg-zinc-200 py-3 rounded-xl font-bold transition-all active:scale-95"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimePicker;
