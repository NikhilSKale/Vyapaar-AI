"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from '@/components/Loader';

export default function Processing() {
    const router = useRouter();

    useEffect(() => {
        // Simulate AI processing delay then route
        const timer = setTimeout(() => {
            router.push('/output');
        }, 2800);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in fade-in zoom-in duration-700">
            <Loader />

            <div className="mt-10 space-y-3">
                <h2 className="text-2xl font-bold text-slate-800 animate-pulse">
                    Enhancing your product...
                </h2>
                <p className="text-slate-500 font-medium">
                    Our AI is doing its magic to create stunning visuals and perfect captions.
                </p>
            </div>

            <div className="mt-12 space-y-2 w-full max-w-[250px]">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-blue-500 rounded-full w-full origin-left animate-[scale-x_2.8s_ease-in-out_forwards]"></div>
                </div>
                <p className="text-xs text-slate-400 text-right animate-pulse">Almost there...</p>
            </div>
        </div>
    );
}
