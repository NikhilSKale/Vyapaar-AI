"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LanguageToggle } from '@/components/LanguageToggle';
import { mockData } from '@/mock/mockData';
import { Download, Copy, Play, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Output() {
    const router = useRouter();
    const [activeLang, setActiveLang] = useState('English');
    const [caption, setCaption] = useState(mockData.captions.english);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Update caption when language changes
        const langKey = activeLang.toLowerCase() as keyof typeof mockData.captions;
        setCaption(mockData.captions[langKey] || mockData.captions.english);
    }, [activeLang]);

    const handleCopy = () => {
        navigator.clipboard.writeText(caption);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = (type: 'image' | 'video') => {
        alert(`Started downloading ${type}!`);
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
                <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-slate-800">Your Campaign Ready</h1>
            </div>

            <div className="p-5 space-y-6">

                {/* Results Card */}
                <Card className="overflow-visible shadow-lg border-orange-100">
                    <div className="p-1 bg-gradient-to-r from-orange-400 to-blue-500 rounded-t-xl mb-4"></div>

                    <div className="px-5 pb-5 space-y-6">

                        {/* Visuals Split */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enhanced Image</span>
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-inner group">
                                    <img
                                        src={mockData.enhancedImage}
                                        alt="Enhanced"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <button
                                        onClick={() => handleDownload('image')}
                                        className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-blue-900 hover:bg-white"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Auto Video Reel</span>
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 shadow-inner group flex items-center justify-center">
                                    <video
                                        src={mockData.reelVideo}
                                        className="w-full h-full object-cover opacity-80"
                                        muted
                                        loop
                                        playsInline
                                        autoPlay
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/40">
                                            <Play size={20} className="ml-1" fill="currentColor" />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDownload('video')}
                                        className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-blue-900 hover:bg-white z-10"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Language & Caption Area */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                    AI Generated Caption
                                </h3>
                            </div>

                            <LanguageToggle
                                options={['English', 'Hindi', 'Marathi', 'Tamil']}
                                selected={activeLang}
                                onSelect={setActiveLang}
                            />

                            <div className="relative mt-3">
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 text-sm leading-relaxed pr-12 min-h-[100px] shadow-sm">
                                    {caption}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="absolute top-3 right-3 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>

                    </div>
                </Card>

                {/* Global Actions */}
                <div className="space-y-3 pt-2">
                    <Button fullWidth className="bg-orange-500 hover:bg-orange-600 gap-2 font-bold py-4">
                        <Download size={20} />
                        Download Complete Package
                    </Button>
                    <Button
                        fullWidth
                        variant="outline"
                        onClick={() => router.push('/create')}
                        className="gap-2 font-semibold text-slate-700 py-4 border-2 border-slate-200"
                    >
                        <RefreshCw size={18} className="text-slate-500" />
                        Create Another Campaign
                    </Button>
                </div>
            </div>
        </div>
    );
}
