import React, { useEffect } from 'react';
import {
  ArrowLeft,
  Home,
  Calendar,
  Sparkles,
  Target,
  Receipt,
  Printer,
  ChevronRight,
  UtensilsCrossed,
  PhoneCall,
} from 'lucide-react';
import { FullPageView, ContextMode } from '../../types';

interface ModuleNavHeaderProps {
  currentView: FullPageView;
  activeMode: ContextMode;
  onBackToDashboard: () => void;
  onSwitchView: (view: FullPageView) => void;
  title: string;
  subtitle?: string;
  badgeText?: string;
  onPrint?: () => void;
  printLabel?: string;
}

export const ModuleNavHeader: React.FC<ModuleNavHeaderProps> = ({
  currentView,
  activeMode,
  onBackToDashboard,
  onSwitchView,
  title,
  subtitle,
  badgeText,
  onPrint,
  printLabel = 'Print Page',
}) => {
  // Listen for Escape key to return to dashboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBackToDashboard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBackToDashboard]);

  const navItems: { view: FullPageView; label: string; icon: React.ReactNode }[] = [
    { view: 'schedule', label: 'Timeline', icon: <Calendar className="w-3.5 h-3.5" /> },
    { view: 'braindump', label: 'Notes', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { view: 'priorities', label: 'Priorities', icon: <Target className="w-3.5 h-3.5" /> },
    { view: 'expenses', label: 'Expenses', icon: <Receipt className="w-3.5 h-3.5" /> },
    { view: 'contacts', label: 'Contacts', icon: <PhoneCall className="w-3.5 h-3.5" /> },
    { view: 'recipes', label: 'Recipe Vault', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
  ];

  const handlePrintClick = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs px-3 sm:px-6 py-2.5 transition-all no-print">
      <div className="max-w-7xl mx-auto flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-2.5 overflow-hidden">
        {/* Left Side: Back button + Breadcrumb */}
        <div className="flex items-center gap-2.5 min-w-0 flex-shrink">
          {/* Prominent Back Button */}
          <button
            id="btn-back-to-dashboard"
            type="button"
            onClick={onBackToDashboard}
            className="group inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-bold text-stone-900 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 border border-stone-300 rounded-xl transition-all shadow-2xs cursor-pointer flex-shrink-0"
            title="Return to Main Dashboard Overview (Shortcut: Esc)"
          >
            <ArrowLeft className="w-4 h-4 text-stone-700 group-hover:-translate-x-0.5 transition-transform" />
            <Home className="w-4 h-4 text-stone-800" />
            <span className="whitespace-nowrap">Back to Dashboard</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono text-stone-600 bg-white border border-stone-300 rounded">
              Esc
            </kbd>
          </button>

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center text-xs text-stone-600 font-medium min-w-0 overflow-hidden">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="hover:text-stone-950 font-bold transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              Dashboard
            </button>
            <ChevronRight className="w-3.5 h-3.5 mx-1 text-stone-400 flex-shrink-0" />
            
            {/* Strictly truncated title so it never forces width or overlaps tabs */}
            <span className="font-bold text-stone-900 truncate max-w-[140px] sm:max-w-[220px] md:max-w-[300px]">
              {title}
            </span>

            {badgeText && (
              <span className="ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 border border-stone-300 hidden 2xl:inline-block flex-shrink-0 whitespace-nowrap">
                {badgeText}
              </span>
            )}
          </nav>
        </div>

        {/* Right Side: Switcher Tabs + Print Button */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-0.5 scrollbar-none justify-start 2xl:justify-end flex-shrink-0">
          <div className="flex items-center gap-1 flex-shrink-0">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => onSwitchView(item.view)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-stone-100/70 hover:bg-stone-200/70 text-stone-600'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dedicated Print Button */}
          <button
            type="button"
            onClick={handlePrintClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200/90 active:bg-stone-300 border border-stone-300 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-2xs ml-1 flex-shrink-0"
            title="Print clean sheet"
          >
            <Printer className="w-3.5 h-3.5 text-stone-700" />
            <span>{printLabel}</span>
          </button>
        </div>
      </div>
    </header>
  );
};