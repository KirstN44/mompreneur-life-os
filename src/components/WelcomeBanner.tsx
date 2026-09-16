import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Layers,
  Receipt,
  X,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { FullPageView } from '../types';

interface WelcomeBannerProps {
  isOpen: boolean;
  onClose: () => void;
  familyKidsMode: boolean;
  onToggleFamilyKidsMode: (enabled: boolean) => void;
  onOpenWorkspace?: (view: FullPageView) => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  isOpen,
  onClose,
  familyKidsMode,
  onToggleFamilyKidsMode,
  onOpenWorkspace,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="welcome-guide-banner"
          key="welcome-guide-banner"
          initial={{ opacity: 0, height: 0, scale: 0.98 }}
          animate={{ opacity: 1, height: 'auto', scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="no-print overflow-hidden my-3.5"
        >
          <div className="bg-stone-100 border border-stone-300 rounded-2xl p-4 sm:p-5 shadow-xs relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-800 shadow-2xs shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-stone-700" />
                </div>

                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm sm:text-base font-serif-heading font-bold text-stone-900">
                      Welcome to your Executive Life & Business Workspace
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-200 text-stone-900 border border-stone-300">
                      Quick Guide
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed max-w-3xl">
                    Organize day-to-day operations with dedicated context modes, rapid time-blocking, split receipt tracking, and focused app workspaces.
                  </p>

                  {/* 3 Core Highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-white rounded-xl border border-stone-300 text-xs text-stone-800 shadow-2xs">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1">
                        <Layers className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                        <span>Context Modes</span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-normal">
                        Switch between <strong>Business</strong>, <strong>Marketing</strong>, <strong>Self & Admin</strong>, and <strong>Family</strong> tabs for focused daily operations.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-stone-300 text-xs text-stone-800 shadow-2xs">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1">
                        <Receipt className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Time-Blocks & Ledger</span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-normal">
                        Log billable work hours, delegate priorities, and split household expenses vs. tax-deductible business write-offs.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-stone-300 text-xs text-stone-800 shadow-2xs">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1">
                        <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>App Workspaces</span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-normal">
                        Expand any module into full-screen workspaces: Recipe Vault & Grocery scaler, Action Kanban, and Emergency Contacts.
                      </p>
                    </div>
                  </div>

                  {/* Solopreneur Toggle Callout & Close Button Footer */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-300 mt-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-800">
                      <span className="font-bold text-stone-900">Active Profile:</span>
                      <button
                        type="button"
                        id="btn-banner-toggle-family-mode"
                        onClick={() => onToggleFamilyKidsMode(!familyKidsMode)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                          familyKidsMode
                            ? 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
                            : 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800'
                        }`}
                      >
                        {familyKidsMode ? (
                          <>
                            <span>👨‍👩‍👧‍👦 Family & Kids Mode (Active)</span>
                            <ToggleRight className="w-4 h-4 text-amber-800 fill-amber-800 inline" />
                          </>
                        ) : (
                          <>
                            <span>💼 Solopreneur Mode (Clean Workspace)</span>
                            <ToggleLeft className="w-4 h-4 text-stone-300 inline" />
                          </>
                        )}
                      </button>
                      <span className="text-[11px] text-stone-600 hidden sm:inline">
                        (Toggle anytime in top header)
                      </span>
                    </div>

                    <button
                      type="button"
                      id="btn-dismiss-welcome-guide"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white border border-stone-900 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs hover:shadow-sm active:scale-95"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Got it, Close Guide</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Close X Button Top Right */}
              <button
                type="button"
                id="btn-close-welcome-x"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 text-stone-500 hover:text-stone-900 rounded-xl hover:bg-white/80 bg-white/40 border border-transparent hover:border-stone-200 transition-all cursor-pointer shrink-0"
                aria-label="Close welcome guide"
                title="Close welcome guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
