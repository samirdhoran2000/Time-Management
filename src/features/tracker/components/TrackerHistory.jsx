import { ddmmyyyyToIso } from "../utils/dateUtils";

const TrackerHistory = ({ entries, onEdit, onDelete, onView, onMove, onSort, isRefreshing, onRefresh }) => {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0 transition-all">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    History
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800/50 text-xs text-zinc-400 font-medium border border-zinc-700/50">{entries.length}</span>
                </h3>
                
                <div className="flex items-center gap-1.5 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
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

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col">
                <div className="overflow-x-auto lg:overflow-y-auto lg:flex-1 no-scrollbar">
                    <table className="w-full text-left relative">
                        <thead className="bg-zinc-900/95 backdrop-blur border-b border-zinc-800 sticky top-0 z-10">
                            <tr>
                                <th className="px-2 py-4"></th>
                                <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Day</th>
                                <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">In</th>
                                <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Out</th>
                                <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Charges</th>
                                <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Exp.</th>
                                <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Km</th>
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
                                        <tr key={e.id} className={`group transition-colors ${
                                                isHoliday ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-100' :
                                                isTodayWarning
                                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-100'
                                                : isHistoryWarning
                                                    ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-50'
                                                    : 'hover:bg-zinc-800/90 even:bg-zinc-800/30'
                                            }`}>
                                            <td className="px-2 py-4">
                                                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => onMove(e.id, 'up')}
                                                        disabled={e.id === entries.length - 1}
                                                        className="p-0.5 rounded text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-0 transition-colors"
                                                        title="Move Up"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => onMove(e.id, 'down')}
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
                                                    <td className={`px-4 py-4 text-sm font-mono ${isTodayWarning ? 'text-red-400' : isHistoryWarning ? 'text-blue-400' : 'text-zinc-400'}`}>{e.charges}</td>
                                                    <td className="px-4 py-4 text-sm text-zinc-400 max-w-[150px] truncate" title={e.expenses || 'N/A'}>{e.expenses || 'N/A'}</td>
                                                    <td className="px-4 py-4 text-sm text-zinc-400 font-mono">{e.kilometres}</td>
                                                    <td className="px-4 py-4 text-sm text-zinc-400 max-w-[150px] truncate" title={e.location}>{e.location}</td>
                                                    <td className="px-4 py-4 text-sm text-zinc-400 capitalize max-w-[130px] truncate">{e.petrol}</td>
                                                </>
                                            )}
                                            
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => onView(e)}
                                                        className="p-1.5 rounded-md text-zinc-500 hover:text-teal-400 hover:bg-teal-500/10 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => onEdit(e)}
                                                        className="p-1.5 rounded-md text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(e.id)}
                                                        className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
    );
};

export default TrackerHistory;
