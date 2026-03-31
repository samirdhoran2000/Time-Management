import React, { useMemo } from 'react';
import { calculateDuration, formatMinutes } from '../utils/dateUtils';

const TrackerStats = ({ entries, sheetName }) => {
    const stats = useMemo(() => {
        let totalKms = 0;
        let totalEarnings = 0;
        let totalMinutes = 0;
        let presentCount = 0;
        let holidayCount = 0;

        entries.forEach(entry => {
            // Kilometres
            const kms = parseFloat(entry.kilometres);
            if (!isNaN(kms)) totalKms += kms;

            // Charges & Attendance
            const charges = parseFloat(entry.charges);
            if (!isNaN(charges)) totalEarnings += charges;

            const isHoliday = entry.inTime && entry.inTime.startsWith('[HOLIDAY]');
            if (isHoliday) {
                holidayCount++;
            } else {
                presentCount++;
            }

            // Duration
            totalMinutes += calculateDuration(entry.inTime, entry.outTime);
        });

        // Calculate Absent based on month
        let absentCount = 0;
        try {
            const parts = (sheetName || "").split(' ');
            if (parts.length >= 2) {
                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                const mIdx = monthNames.indexOf(parts[0]);
                const year = parseInt(parts[1]);
                if (mIdx !== -1 && !isNaN(year)) {
                    const daysInMonth = new Date(year, mIdx + 1, 0).getDate();
                    absentCount = Math.max(0, daysInMonth - entries.length);
                }
            }
        } catch (e) {
            console.error("Month parse error", e);
        }

        return {
            totalKms: totalKms.toFixed(1),
            totalEarnings: totalEarnings.toLocaleString('en-IN', {
                maximumFractionDigits: 0,
                style: 'currency',
                currency: 'INR'
            }),
            totalWorkingHours: formatMinutes(totalMinutes),
            presentCount,
            holidayCount,
            absentCount
        };
    }, [entries, sheetName]);

    if (!entries || entries.length === 0) return null;

    return (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
            <StatCard
                label="Earnings"
                value={stats.totalEarnings}
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                color="text-indigo-400"
            />
            <StatCard
                label="Distance & Presence"
                value={`${stats.totalKms} KM`}
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                color="text-emerald-400"
            />
            <StatCard
                label="Hours"
                value={stats.totalWorkingHours}
                subInfo={
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold tracking-tight">
                        <span className="text-emerald-500">{stats.presentCount}P</span>
                        <span className="text-zinc-700">•</span>
                        <span className="text-sky-500">{stats.holidayCount}H</span>
                        <span className="text-zinc-700">•</span>
                        <span className="text-red-500/80">{stats.absentCount}A</span>
                    </div>
                }
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                color="text-amber-400"
            />
        </div>
    );
};

const StatCard = ({ label, value, subInfo, icon, color }) => (
    <div className="bg-zinc-900/40 border border-zinc-800/50 p-3 sm:px-4 sm:py-3.5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3.5 transition-all hover:bg-zinc-900/60 hover:border-zinc-700/50">
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center shrink-0 ${color}`}>
            {icon}
        </div>
        <div className="text-center sm:text-left min-w-0 w-full overflow-hidden">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider truncate">{label}</p>
            <p className="text-sm sm:text-lg font-black text-white mt-0.5 truncate">{value}</p>
            {subInfo}
        </div>
    </div>
);

export default TrackerStats;
