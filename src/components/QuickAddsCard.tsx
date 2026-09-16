import React, { useState } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { ContextMode } from '../types';
import { MODE_CONFIGS } from '../constants';

interface QuickAddsCardProps {
  activeMode: ContextMode;
  customQuickAdds: string[];
  onAddScheduleItem: (title: string) => void;
  onOpenAddModal: () => void;
  onDeleteCustomQuickAdd: (index: number) => void;
}

export const QuickAddsCard: React.FC<QuickAddsCardProps> = ({
  activeMode,
  customQuickAdds,
  onAddScheduleItem,
  onOpenAddModal,
  onDeleteCustomQuickAdd,
}) => {
  const config = MODE_CONFIGS[activeMode];
  const [clickedItem, setClickedItem] = useState<string | null>(null);

  const handleQuickAddClick = (text: string) => {
    setClickedItem(text);
    onAddScheduleItem(text);
    setTimeout(() => {
      setClickedItem(null);
    }, 600);
  };

  const defaultAdds = config.defaultQuickAdds;

  return (
    <div
      id="quick-adds-card"
      className={`rounded-2xl border ${config.cardBorder} ${config.cardBg} p-4 transition-all duration-200 shadow-xs mb-6`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-white/80 border border-stone-200/60 shadow-2xs">
            <Sparkles className={`w-3.5 h-3.5 ${config.badgeText}`} />
          </span>
          <h2
            id="quickAddTitle"
            className="text-xs sm:text-sm font-bold text-stone-800 tracking-tight font-serif-heading"
          >
            {config.title}
          </h2>
          <span className="text-[11px] text-stone-500 hidden sm:inline">
            (1-click add to today's schedule)
          </span>
        </div>

        <button
          id="btn-add-custom-quick"
          type="button"
          onClick={onOpenAddModal}
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg text-white shadow-xs transition-opacity hover:opacity-90 ${
            activeMode === 'family'
              ? 'bg-rose-700'
              : activeMode === 'business'
              ? 'bg-blue-700'
              : activeMode === 'marketing'
              ? 'bg-amber-600'
              : 'bg-purple-700'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Quick Add</span>
        </button>
      </div>

      <div id="quickAddsContainer" className="flex flex-wrap gap-2">
        {/* Default quick adds */}
        {defaultAdds.map((item) => {
          const isRecentlyClicked = clickedItem === item;
          return (
            <button
              key={`def-${item}`}
              type="button"
              onClick={() => handleQuickAddClick(item)}
              title={`Add "${item}" to schedule`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50 shadow-2xs transition-all active:scale-95 ${
                isRecentlyClicked
                  ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-stone-200/90'
              }`}
            >
              <span className="text-stone-400 font-bold text-[13px] leading-none">+</span>
              <span>{item}</span>
            </button>
          );
        })}

        {/* Custom quick adds */}
        {customQuickAdds.map((item, idx) => {
          const cleanText = item.replace(/^\+\s*/, '');
          const isRecentlyClicked = clickedItem === cleanText;

          return (
            <div
              key={`custom-${idx}`}
              className="group inline-flex items-center rounded-lg border border-dashed border-stone-300 bg-white/95 text-stone-800 shadow-2xs hover:border-stone-400"
            >
              <button
                type="button"
                onClick={() => handleQuickAddClick(cleanText)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
                  isRecentlyClicked
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                <span className="text-stone-400 font-bold text-[13px] leading-none">+</span>
                <span>{cleanText}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCustomQuickAdd(idx);
                }}
                title="Delete custom quick add"
                aria-label={`Delete custom quick add ${cleanText}`}
                className="pr-2 pl-1 py-1 text-stone-400 hover:text-rose-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
