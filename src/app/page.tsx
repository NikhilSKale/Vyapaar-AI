import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Sparkles, Megaphone, Image as ImageIcon, Video, ArrowRight } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <ImageIcon className="text-blue-500" size={24} />,
      title: 'AI Image Enhancement',
      desc: 'Turn casual product photos into professional-grade studio shots instantly.'
    },
    {
      icon: <Megaphone className="text-orange-500" size={24} />,
      title: 'Multilingual Captions',
      desc: 'Reach more customers with AI-written captions in English, Hindi, Marathi & Tamil.'
    },
    {
      icon: <Video className="text-purple-500" size={24} />,
      title: 'Reel Generation',
      desc: 'Automagically generate engaging social media reels from static images.'
    }
  ];

  return (
    <div className="flex flex-col animate-in fade-in zoom-in-95 duration-500">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-900 to-blue-800 text-white px-6 py-12 pb-20 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-800/50 backdrop-blur-sm border border-blue-700 rounded-full px-3 py-1 text-sm font-medium text-blue-100 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            New: Video Reels & Local Languages!
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            10x Your <span className="text-orange-400">Business</span> Reach
          </h1>
          <p className="text-blue-100/90 text-[15px] leading-relaxed max-w-[280px]">
            The all-in-one AI marketing suite for small businesses. Stand out, sell more.
          </p>
          <div className="pt-4">
            <Link href="/create" className="inline-block w-full">
              <Button fullWidth className="group bg-orange-500 hover:bg-orange-400 text-lg shadow-orange-500/25">
                Start Creating Free Let's Go
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-5 py-8 -mt-8 relative z-20 space-y-4">
        {features.map((feature, idx) => (
          <Card key={idx} className="p-4 flex items-start gap-4">
            <div className="p-3 bg-slate-50 rounded-xl">
              {feature.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-[15px] mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-500 leading-snug">{feature.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Testimonial / Trust */}
      <div className="px-5 pb-8 text-center text-sm text-slate-400 font-medium">
        Trusted by 10,000+ local businesses in India
      </div>
    </div>
  );
}
