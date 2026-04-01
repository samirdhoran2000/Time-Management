import { useState } from "react";
import { ddmmyyyyToIso } from "../utils/dateUtils";

const TrackerHistory = ({ entries, onEdit, onDelete, onView, onMove, onSort, isRefreshing, onRefresh }) => {
    const [selectedId, setSelectedId] = useState(null);
    const [viewMode, setViewMode] = useState('auto'); // 'auto', 'table', 'cards'

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0 transition-all">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    History
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800/50 text-xs text-zinc-400 font-medium border border-zinc-700/50">{entries.length}</span>
                </h3>
                
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800/50 backdrop-blur-sm shadow-inner">
                    {/* View Switcher */}
                    <div className="flex items-center gap-1 bg-zinc-950/50 p-0.5 rounded-lg border border-zinc-800/50">
                        <button
                            onClick={() => setViewMode('auto')}
                            className={`p-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${viewMode === 'auto' ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
                            title="Auto Responsive"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            Auto
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${viewMode === 'table' ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
                            title="Force Table View"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Table
                        </button>
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`p-1.5 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${viewMode === 'cards' ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
                            title="Force Card View"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            Cards
                        </button>
                    </div>

                    <div className="w-px h-4 bg-zinc-800 mx-0.5" />

                    <button
                        onClick={onRefresh}
                        className={`p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`}
                        title="Refresh History"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                    
                    <div className="w-px h-4 bg-zinc-800 mx-0.5" />
                    
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onSort('desc')}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20 flex items-center gap-1.5"
                            title="Newest Row on Top"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                            Newest
                        </button>
                        <button
                            onClick={() => onSort('asc')}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all border border-transparent flex items-center gap-1.5"
                            title="Oldest Row on Top"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" /></svg>
                            Oldest
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0">
                {/* Mobile Card View (shown below lg) */}
                <div className={`${viewMode === 'cards' ? 'flex' : viewMode === 'table' ? 'hidden' : 'lg:hidden'} flex-col gap-3 overflow-y-auto pb-8 no-scrollbar`}>
                    {entries.length === 0 ? (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 mb-4 opacity-50">
                                <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                            <p className="text-zinc-500 text-sm font-medium">No entries yet</p>
                        </div>
                    ) : (
                        entries.map((e) => {
                            const today = new Date().toISOString().split("T")[0];
                            const rowDate = ddmmyyyyToIso(e.date);
                            const isToday = rowDate === today;
                            const isMissingData = !e.inTime || !e.outTime || Number(e.charges) === 0;
                            const isHoliday = e.inTime && e.inTime.startsWith('[HOLIDAY]');
                            const holidayName = isHoliday ? e.inTime.replace('[HOLIDAY] ', '') : '';
                            const isTodayWarning = isToday && isMissingData && !isHoliday;
                            const isHistoryWarning = !isToday && isMissingData && !isHoliday;

                            return (
                                <div 
                                    key={`card-${e.id}`}
                                    onClick={() => setSelectedId(prev => prev === e.id ? null : e.id)}
                                    className={`relative p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                                        isHoliday ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' :
                                        isTodayWarning ? 'bg-red-500/10 border-red-500/20' :
                                        isHistoryWarning ? 'bg-blue-500/10 border-blue-500/20' :
                                        'bg-zinc-900 border-zinc-800 shadow-sm'
                                    } ${selectedId === e.id ? 'ring-2 ring-indigo-500 border-indigo-500/50' : ''}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold font-mono ${isHoliday ? 'text-emerald-400' : isTodayWarning ? 'text-red-400' : isHistoryWarning ? 'text-blue-400' : 'text-zinc-100'}`}>
                                                    {e.date}
                                                </span>
                                                {isToday && <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">Today</span>}
                                            </div>
                                            <span className="text-[11px] text-zinc-500 uppercase font-medium">{e.day}</span>
                                        </div>
                                        <div className={`flex items-center gap-1 transition-opacity ${selectedId === e.id ? 'opacity-100' : 'opacity-0'}`}>
                                            <button onClick={(ev) => { ev.stopPropagation(); onMove(e.id, 'up'); }} disabled={e.id === entries.length - 1} className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 disabled:opacity-20"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" /></svg></button>
                                            <button onClick={(ev) => { ev.stopPropagation(); onMove(e.id, 'down'); }} disabled={e.id === 0} className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 disabled:opacity-20"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg></button>
                                        </div>
                                    </div>

                                    {isHoliday ? (
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs mb-3">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                            {holidayName}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="p-2 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                                                <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">In/Out</span>
                                                <span className="text-xs text-zinc-300 font-mono">{e.inTime || '--'} - {e.outTime || '--'}</span>
                                            </div>
                                            <div className="p-2 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                                                <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Km</span>
                                                <span className="text-xs text-zinc-300 font-mono">{e.kilometres || '--'}</span>
                                            </div>
                                            <div className="p-2 rounded-xl bg-zinc-800/30 border border-zinc-800/50 col-span-2 flex justify-between items-center">
                                                <div>
                                                    <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-0.5">Location</span>
                                                    <span className="text-xs text-zinc-300 truncate max-w-[150px] block">{e.location || 'N/A'}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-0.5">Charges</span>
                                                    <span className={`text-xs font-bold font-mono ${isTodayWarning ? 'text-red-400' : isHistoryWarning ? 'text-blue-400' : 'text-emerald-400'}`}>₹{e.charges || '0'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                                        <span className="text-[10px] text-zinc-600 font-medium italic truncate max-w-[120px]">{e.expenses ? `Exp: ${e.expenses}` : 'No expenses'}</span>
                                        <div className="flex items-center gap-1">
                                            <button onClick={(ev) => { ev.stopPropagation(); onView(e); }} className="p-2 rounded-lg text-zinc-400 active:bg-teal-500/10 active:text-teal-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                                            <button onClick={(ev) => { ev.stopPropagation(); onEdit(e); }} className="p-2 rounded-lg text-zinc-400 active:bg-indigo-500/10 active:text-indigo-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                            <button onClick={(ev) => { ev.stopPropagation(); onDelete(e.id); }} className="p-2 rounded-lg text-zinc-400 active:bg-red-500/10 active:text-red-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Desktop Table View (shown on lg and above) */}
                <div className={`${viewMode === 'table' ? 'flex' : viewMode === 'cards' ? 'hidden' : 'hidden lg:flex'} flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex-1 min-h-0`}>
                    <div className="overflow-x-auto lg:overflow-y-auto lg:flex-1 no-scrollbar">
                        <table className="w-full text-left relative">
                            <thead className="bg-zinc-900/95 backdrop-blur border-b border-zinc-800 sticky top-0 z-10">
                                <tr>
                                    <th className="px-2 py-4"></th>
                                    <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Day</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">In</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Out</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Km</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Charges</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Exp.</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Loc.</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fuel</th>
                                    <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {entries.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" className="px-6 py-16 text-center">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 mb-4 opacity-50">
                                                <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                            </div>
                                            <p className="text-zinc-500 text-sm font-medium">No entries yet</p>
                                            <p className="text-zinc-600 text-xs mt-1">Start by adding a new entry.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    entries.map((e) => {
                                        const today = new Date().toISOString().split("T")[0];
                                        const rowDate = ddmmyyyyToIso(e.date);
                                        const isToday = rowDate === today;
                                        const isMissingData = !e.inTime || !e.outTime || Number(e.charges) === 0;
                                        const isHoliday = e.inTime && e.inTime.startsWith('[HOLIDAY]');
                                        const holidayName = isHoliday ? e.inTime.replace('[HOLIDAY] ', '') : '';
                                        const isTodayWarning = isToday && isMissingData && !isHoliday;
                                        const isHistoryWarning = !isToday && isMissingData && !isHoliday;

                                        return (
                                            <tr 
                                                key={`row-${e.id}`} 
                                                onClick={() => setSelectedId(prev => prev === e.id ? null : e.id)}
                                                className={`group transition-colors cursor-pointer lg:cursor-default ${
                                                    isHoliday ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-100' :
                                                    isTodayWarning
                                                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-100'
                                                    : isHistoryWarning
                                                        ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-50'
                                                        : 'hover:bg-zinc-800/90 even:bg-zinc-800/30'
                                                } ${selectedId === e.id ? 'ring-1 ring-inset ring-indigo-500/50 bg-indigo-500/5' : ''}`}
                                            >
                                                <td className="px-2 py-4">
                                                    <div className={`flex flex-col gap-0.5 transition-opacity ${selectedId === e.id ? 'opacity-100' : 'opacity-0 lg:group-hover:opacity-100'}`}>
                                                        <button
                                                            onClick={(ev) => { ev.stopPropagation(); onMove(e.id, 'up'); }}
                                                            disabled={e.id === entries.length - 1}
                                                            className="p-0.5 rounded text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-0 transition-colors"
                                                            title="Move Up"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={(ev) => { ev.stopPropagation(); onMove(e.id, 'down'); }}
                                                            disabled={e.id === 0}
                                                            className="p-0.5 rounded text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-0 transition-colors"
                                                            title="Move Down"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className={`px-4 py-4 text-sm font-mono whitespace-nowrap ${isHoliday ? 'text-emerald-400 font-bold' : isTodayWarning ? 'text-red-400' : isHistoryWarning ? 'text-blue-400' : 'text-zinc-400'}`}>{e.date}</td>
                                                <td className={`px-4 py-4 text-sm ${isHoliday ? 'text-emerald-300 font-medium' : 'text-zinc-300'}`}>{e.day}</td>
                                                
                                                {isHoliday ? (
                                                    <td colSpan="7" className="px-4 py-4 text-center">
                                                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-sm border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                            </svg>
                                                            {holidayName}
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                            </svg>
                                                        </span>
                                                    </td>
                                                ) : (
                                                    <>
                                                        <td className="px-4 py-4 text-sm text-zinc-400">{e.inTime}</td>
                                                        <td className="px-4 py-4 text-sm text-zinc-400">{e.outTime}</td>
                                                        <td className="px-4 py-4 text-sm text-zinc-400 font-mono">{e.kilometres}</td>
                                                        <td className={`px-4 py-4 text-sm font-mono ${isTodayWarning ? 'text-red-400' : isHistoryWarning ? 'text-blue-400' : 'text-zinc-400'}`}>{e.charges}</td>
                                                        <td className="px-4 py-4 text-sm text-zinc-400 max-w-[150px] truncate" title={e.expenses || 'N/A'}>{e.expenses || 'N/A'}</td>
                                                        <td className="px-4 py-4 text-sm text-zinc-400 max-w-[150px] truncate" title={e.location}>{e.location}</td>
                                                        <td className="px-4 py-4 text-sm text-zinc-400 capitalize max-w-[130px] truncate">{e.petrol}</td>
                                                    </>
                                                )}
                                                
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(ev) => { ev.stopPropagation(); onView(e); }}
                                                            className={`p-1.5 rounded-md transition-colors ${selectedId === e.id ? 'text-teal-400 bg-teal-500/10' : 'text-zinc-500 hover:text-teal-400 hover:bg-teal-500/10'}`}
                                                            title="View Details"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={(ev) => { ev.stopPropagation(); onEdit(e); }}
                                                            className={`p-1.5 rounded-md transition-colors ${selectedId === e.id ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10'}`}
                                                            title="Edit"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={(ev) => { ev.stopPropagation(); onDelete(e.id); }}
                                                            className={`p-1.5 rounded-md transition-colors ${selectedId === e.id ? 'text-red-400 bg-red-500/10' : 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'}`}
                                                            title="Delete"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackerHistory;
