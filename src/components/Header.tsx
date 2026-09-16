import React, { useRef } from 'react';
import { Printer, Download, Upload, RotateCcw, Calendar as CalendarIcon, Coins, Heart, Users, HelpCircle, Sparkles } from 'lucide-react';
import { CurrencyCode } from '../types';
import { CURRENCY_OPTIONS } from '../constants';

interface HeaderProps {
  currentDateStr: string;
  currency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
  onExport: () => void;
  onImportClick: () => void;
  onResetClick: () => void;
  onPrint: () => void;
  activeModeLabel: string;
  familyKidsMode: boolean;
  onToggleFamilyKidsMode: (enabled: boolean) => void;
  showGuide?: boolean;
  onToggleGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDateStr,
  currency,
  onCurrencyChange,
  onExport,
  onImportClick,
  onResetClick,
  onPrint,
  activeModeLabel,
  familyKidsMode,
  onToggleFamilyKidsMode,
  showGuide,
  onToggleGuide,
}) => {
  // Format human friendly date
  const humanDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="mb-6 pt-2">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Life &amp; Business OS
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-200 text-stone-900 border border-stone-300">
              <CalendarIcon className="w-3.5 h-3.5 text-stone-700" />
              {humanDate}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
            Seamlessly switch contexts between family, clients, marketing, and daily operations.
          </p>
        </div>

        {/* Toolbar */}
        <div className="no-print flex flex-wrap items-center gap-2">
          {/* Family & Kids Mode User Settings Toggle */}
          <div
            id="setting-family-mode-wrapper"
            className="flex items-center gap-2 bg-white px-2.5 py-1.5 border border-stone-300 rounded-lg shadow-xs hover:border-stone-400 transition-colors"
            title={familyKidsMode ? 'Family & Kids Mode enabled: Showing family context & kid tags' : 'Family & Kids Mode disabled: Tailored for solo life & business operations'}
          >
            <div className="flex items-center gap-1.5">
              <Heart className={`w-3.5 h-3.5 ${familyKidsMode ? 'text-amber-700 fill-amber-700' : 'text-stone-400'}`} />
              <span className="text-xs font-semibold text-stone-800 whitespace-nowrap">
                Family &amp; Kids Mode
              </span>
            </div>
            <button
              type="button"
              id="btn-toggle-family-mode"
              role="switch"
              aria-checked={familyKidsMode}
              onClick={() => onToggleFamilyKidsMode(!familyKidsMode)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-stone-500/20 ${
                familyKidsMode ? 'bg-amber-700' : 'bg-stone-300'
              }`}
            >
              <span className="sr-only">Toggle Family &amp; Kids Mode</span>
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  familyKidsMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                familyKidsMode
                  ? 'bg-amber-100 text-amber-950 border border-amber-300'
                  : 'bg-stone-200 text-stone-800 border border-stone-300'
              }`}
            >
              {familyKidsMode ? 'ON' : 'OFF'}
            </span>
          </div>

          {onToggleGuide && (
            <button
              id="btn-toolbar-guide"
              type="button"
              onClick={onToggleGuide}
              title={showGuide ? 'Hide quick guide' : 'Show quick guide'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-xs ${
                showGuide
                  ? 'bg-stone-900 text-white border border-stone-900'
                  : 'bg-white text-stone-800 border border-stone-300 hover:bg-stone-100'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${showGuide ? 'text-amber-300' : 'text-stone-500'}`} />
              <span>{showGuide ? 'Guide Open' : 'Guide'}</span>
            </button>
          )}

          <button
            id="btn-toolbar-print"
            onClick={onPrint}
            title="Print daily planner view"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" />
            <span>Print Sheet</span>
          </button>

          <button
            id="btn-toolbar-backup"
            onClick={onExport}
            title="Export local data to JSON backup"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-stone-600" />
            <span>Backup</span>
          </button>

          <button
            id="btn-toolbar-restore"
            onClick={onImportClick}
            title="Restore from JSON backup file"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-stone-600" />
            <span>Restore</span>
          </button>

          <button
            id="btn-toolbar-reset"
            onClick={onResetClick}
            title="Reset to default template"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 border border-stone-300 rounded-lg hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-1 ml-1 bg-white px-2 py-1 border border-stone-300 rounded-lg shadow-xs">
            <Coins className="w-3.5 h-3.5 text-stone-500" />
            <select
              id="currencySelect"
              aria-label="Select Currency"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
              className="text-xs font-bold text-stone-800 bg-transparent border-none focus:outline-none cursor-pointer pr-1"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
