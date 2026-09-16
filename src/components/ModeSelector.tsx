import React from 'react';
import { Heart, Briefcase, Megaphone, Sparkles, Layers } from 'lucide-react';
import { ContextMode } from '../types';
import { MODE_CONFIGS } from '../constants';

interface ModeSelectorProps {
  activeMode: ContextMode;
  onSelectMode: (mode: ContextMode) => void;
  showAllModes: boolean;
  onToggleShowAllModes: (val: boolean) => void;
  itemCountsByMode: Record<ContextMode, number>;
  familyKidsMode?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  activeMode,
  onSelectMode,
  showAllModes,
  onToggleShowAllModes,
  itemCountsByMode,
  familyKidsMode = true,
}) => {
  const allModes: ContextMode[] = ['family', 'business', 'marketing', 'self'];
  const modes: ContextMode[] = familyKidsMode
    ? allModes
    : allModes.filter((m) => m !== 'family');

  const getIcon = (mode: ContextMode) => {
    switch (mode) {
      case 'family':
        return <Heart className="w-4 h-4 fill-current shrink-0" />;
      case 'business':
        return <Briefcase className="w-4 h-4 shrink-0" />;
      case 'marketing':
        return <Megaphone className="w-4 h-4 shrink-0" />;
      case 'self':
        return <Sparkles className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
          Focus Context
        </span>
        <button
          id="btn-toggle-all-contexts"
          type="button"
          onClick={() => onToggleShowAllModes(!showAllModes)}
          className={`no-print inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full transition-all ${
            showAllModes
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
          }`}
          title="Toggle between single-context view and full-day overview"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{showAllModes ? 'Viewing All Contexts' : 'Show All in Timeline'}</span>
        </button>
      </div>

      <div className={`grid gap-2.5 ${modes.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
        {modes.map((mode) => {
          const config = MODE_CONFIGS[mode];
          const isActive = activeMode === mode;
          const count = itemCountsByMode[mode] || 0;

          return (
            <button
              key={mode}
              id={`btn-${mode}`}
              onClick={() => {
                onSelectMode(mode);
              }}
              className={`relative flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? `${config.activeBtnBg} ring-2 ring-offset-1 ring-stone-900/30 font-bold`
                  : 'bg-white hover:bg-stone-100 text-stone-900 border-stone-300 shadow-2xs hover:border-stone-400 font-semibold'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={isActive ? 'text-white' : config.badgeText}>
                  {getIcon(mode)}
                </span>
                <span className="text-xs sm:text-sm truncate">
                  {config.shortTitle}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-stone-200 text-stone-800'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
