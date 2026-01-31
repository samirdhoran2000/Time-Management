import React, { useMemo } from 'react';
import { calculateDuration, formatMinutes } from '../utils/dateUtils';

const TrackerStats = ({ entries }) => {
    const stats = useMemo(() => {
        let totalKms = 0;
        let totalEarnings = 0;
        let totalMinutes = 0;

        entries.forEach(entry => {
            // Kilometres
            const kms = parseFloat(entry.kilometres);
            if (!isNaN(kms)) totalKms += kms;

            // Charges
            const charges = parseFloat(entry.charges);
            if (!isNaN(charges)) totalEarnings += charges;

            // Duration
            totalMinutes += calculateDuration(entry.inTime, entry.outTime);
        });

        return {
            totalKms: totalKms.toFixed(2),
            totalEarnings: totalEarnings.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                style: 'currency',
                currency: 'INR'
            }),
            totalWorkingHours: formatMinutes(totalMinutes)
        };
    }, [entries]);

    if (!entries || entries.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard
                label="Total Distance"
                value={`${stats.totalKms} KM`}
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                color="text-emerald-400"
            />
            <StatCard
                label="Total Earnings"
                value={stats.totalEarnings}
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                color="text-indigo-400"
            />
            <StatCard
                label="Working Hours"
                value={stats.totalWorkingHours}
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                color="text-amber-400"
            />
        </div>
    );
};

const StatCard = ({ label, value, icon, color }) => (
    <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-2xl flex items-center gap-4 transition-all hover:border-zinc-700/50">
        <div className={`w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{label}</p>
            <p className="text-xl font-bold text-white mt-1 whitespace-nowrap">{value}</p>
        </div>
    </div>
);

export default TrackerStats;
