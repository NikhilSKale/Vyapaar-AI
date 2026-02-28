"use client";

import React, { useState, useEffect } from 'react';
import { CampaignCard } from '@/components/CampaignCard';
import { mockData } from '@/mock/mockData';
import { Search, Filter, History } from 'lucide-react';

export default function Campaigns() {
    const [campaigns, setCampaigns] = useState(mockData.campaigns);
    const [search, setSearch] = useState('');

    // Simulate minimal filtering
    useEffect(() => {
        if (search) {
            setCampaigns(mockData.campaigns.filter(c =>
                c.caption.toLowerCase().includes(search.toLowerCase()) ||
                c.language.toLowerCase().includes(search.toLowerCase())
            ));
        } else {
            setCampaigns(mockData.campaigns);
        }
    }, [search]);

    return (
        <div className="p-5 flex flex-col space-y-6 pb-24 animate-in fade-in duration-500">

            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Campaigns</h1>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                            <History size={14} /> Recently generated
                        </p>
                    </div>
                    <div className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {campaigns.length} Total
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white border border-slate-200 text-sm rounded-xl pl-10 pr-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm"
                        />
                    </div>
                    <button className="bg-slate-800 text-white p-3 rounded-xl hover:bg-slate-700 transition-colors shadow-sm focus:ring-2 focus:ring-slate-400">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            {campaigns.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {campaigns.map((camp) => (
                        <CampaignCard
                            key={camp.id}
                            thumbnail={camp.thumbnail}
                            caption={camp.caption}
                            language={camp.language}
                            date={camp.date}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">No campaigns found.</p>
                </div>
            )}

        </div>
    );
}
