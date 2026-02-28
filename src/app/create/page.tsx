"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadBox } from '@/components/UploadBox';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Globe, Lightbulb, Type } from 'lucide-react';

export default function Create() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState('clothing');
    const [language, setLanguage] = useState('English');
    const [tone, setTone] = useState('professional');

    const handleGenerate = () => {
        if (!file) {
            alert("Please upload an image first.");
            return;
        }

        // In a real app, you might save state to a store or context here
        // For now we just route to processing
        router.push('/processing');
    };

    const categories = [
        { value: 'clothing', label: 'Apparel & Clothing' },
        { value: 'electronics', label: 'Electronics & Mobiles' },
        { value: 'food', label: 'Food & Groceries' },
        { value: 'jewelry', label: 'Jewelry & Accessories' },
        { value: 'other', label: 'Other Retail' },
    ];

    const languages = ['English', 'Hindi', 'Marathi', 'Tamil'];
    const tones = ['Professional', 'Casual', 'Urgent/Sale', 'Funny'];

    return (
        <div className="p-5 flex flex-col space-y-6 pb-20 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-800">New Campaign</h1>
                <p className="text-sm text-slate-500">Upload your product photo and let AI do the rest.</p>
            </div>

            <UploadBox onFileSelect={setFile} selectedFile={file} />

            <div className="space-y-5">
                {/* Category */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                        <Lightbulb size={16} className="text-orange-500" />
                        Business Category
                    </label>
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full appearance-none bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-sm transition-all"
                        >
                            {categories.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Translation Options Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            <Globe size={16} className="text-blue-500" />
                            Language
                        </label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full appearance-none bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 shadow-sm"
                        >
                            {languages.map((l) => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                            <Type size={16} className="text-purple-500" />
                            Tone
                        </label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full appearance-none bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 shadow-sm"
                        >
                            {tones.map((t) => (
                                <option key={t} value={t.toLowerCase()}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <Button
                    fullWidth
                    onClick={handleGenerate}
                    disabled={!file}
                    className="bg-blue-900 text-lg py-4 shadow-xl hover:bg-blue-950 hover:shadow-2xl transition-all"
                >
                    Generate Marketing Magic 🚀
                </Button>
            </div>
        </div>
    );
}
