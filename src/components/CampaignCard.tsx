import React from 'react';
import { Card } from './Card';
import { Globe } from 'lucide-react';

interface CampaignCardProps {
    thumbnail: string;
    caption: string;
    language: string;
    date: string;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ thumbnail, caption, language, date }) => {
    return (
        <Card className="flex flex-col h-full hover:-translate-y-1 transition-transform">
            <div className="relative h-48 w-full">
                <img
                    src={thumbnail}
                    alt="Campaign Thumbnail"
                    className="w-full h-full object-cover rounded-t-xl"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-blue-900 shadow-sm flex items-center gap-1">
                    <Globe size={12} className="text-orange-500" />
                    {language}
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <p className="text-xs text-slate-400 mb-2 font-medium">{date}</p>
                <p className="text-sm font-medium text-slate-700 line-clamp-3 leading-relaxed flex-grow">
                    {caption}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-blue-600 text-sm font-semibold cursor-pointer group">
                    <span>View Details</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
            </div>
        </Card>
    );
};
