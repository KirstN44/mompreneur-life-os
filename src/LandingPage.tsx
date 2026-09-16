import React from 'react';
import { Sparkles, ArrowRight, Heart, Users, Briefcase } from 'lucide-react';

interface LandingPageProps {
  onEnterOS: () => void;
}

export default function LandingPage({ onEnterOS }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col justify-between p-6 sm:p-12">
      <div className="max-w-3xl mx-auto space-y-8 my-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Welcome to my quiet corner</span>
        </div>

        {/* Headline & Story */}
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
          Balancing business, family, and operations without losing your mind.
        </h1>
        
        <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
          As solopreneurs and parents, we carry a million mental loops at once—from client proposals and marketing reels to school projects and family schedules. I built this Life & Business OS to bring calm, structure, and clarity to the chaos.
        </p>

        {/* Feature highlights grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm space-y-2">
            <Users className="w-5 h-5 text-amber-700" />
            <h3 className="font-semibold text-sm">Family & Kids Mode</h3>
            <p className="text-xs text-stone-500">Keep school drop-offs, appointments, and prep checklists transparent and aligned.</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm space-y-2">
            <Briefcase className="w-5 h-5 text-amber-700" />
            <h3 className="font-semibold text-sm">Business Contexts</h3>
            <p className="text-xs text-stone-500">Isolate client tasks, marketing campaigns, and tax-claimable receipts effortlessly.</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-sm space-y-2">
            <Heart className="w-5 h-5 text-amber-700" />
            <h3 className="font-semibold text-sm">Self Care & Admin</h3>
            <p className="text-xs text-stone-500">Never let your own personal wellness routines fall off the bottom of the to-do list.</p>
          </div>
        </div>

        {/* Call to action */}
        <div className="pt-6">
          <button
            onClick={onEnterOS}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-800 text-white font-medium px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            <span>Explore the Live OS Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <footer className="max-w-3xl mx-auto w-full pt-8 text-center text-xs text-stone-400 border-t border-stone-200">
        Life & Business OS • Designed for creators, makers, and busy parents.
      </footer>
    </div>
  );
}
