import React from 'react';

interface LanguageToggleProps {
    selected: string;
    onSelect: (lang: string) => void;
    options: string[];
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ selected, onSelect, options }) => {
    return (
        <div className="flex bg-slate-100 rounded-xl p-1 overflow-x-auto no-scrollbar shadow-inner">
            {options.map((lang) => (
                <button
                    key={lang}
                    onClick={() => onSelect(lang)}
                    className={`flex-1 min-w-[80px] text-sm py-2 px-3 rounded-lg font-medium transition-all duration-300 ${selected === lang
                            ? 'bg-white text-blue-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                >
                    {lang}
                </button>
            ))}
        </div>
    );
};
