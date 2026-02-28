"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, LayoutList } from 'lucide-react';

export const Navbar = () => {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Create', path: '/create', icon: PlusCircle },
        { name: 'Campaigns', path: '/campaigns', icon: LayoutList },
    ];

    return (
        <>
            <div className="fixed top-0 left-0 right-0 h-16 bg-blue-900 shadow-md z-50 flex items-center justify-between px-4 max-w-md mx-auto">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">V.</span>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">VyapaarAI</span>
                </Link>
                <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs">
                    US
                </div>
            </div>

            {/* Bottom Nav Spacer */}
            {/* Handled by Layout */}

            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-t border-slate-100 z-50 max-w-md mx-auto h-16">
                <div className="flex justify-around items-center h-full px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex flex-col items-center justify-center w-20 h-full rounded-xl transition-all duration-200 ${isActive ? 'text-orange-500' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                <Icon size={22} className={isActive ? 'mb-1' : 'mb-1 opacity-80'} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-semibold">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
};
