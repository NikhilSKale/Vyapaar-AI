import React from 'react';

export const Loader: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-2 bg-blue-50 rounded-full animate-pulse flex items-center justify-center">
                    <span className="text-blue-900 font-bold text-xl">V.</span>
                </div>
            </div>
        </div>
    );
};
