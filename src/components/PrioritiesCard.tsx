import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  UserCheck,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Layers,
  Repeat,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { ContextMode, PriorityItem, PrioritySubTask, DelegationStatus, RecurrenceFrequency } from '../types';
import { MODE_CONFIGS, DURATION_OPTIONS } from '../constants';

interface PrioritiesCardProps {
  priorities: PriorityItem[];
  activeMode: ContextMode;
  familyKidsMode?: boolean;
  onAddPriority: (
    text: string,
    mode?: ContextMode,
    extra?: {
      duration?: string;
      delegation?: DelegationStatus;
      subTasks?: PrioritySubTask[];
      recurrence?: PriorityItem['recurrence'];
    }
  ) => void;
  onTogglePriority: (id: number) => void;
  onDeletePriority: (id: number) => void;
  onClearCompleted: () => void;
  onUpdatePriority?: (updated: PriorityItem) => void;
  onOpenFullView?: () => void;
}

const DELEGATION_CONFIG: Record<
  DelegationStatus,
  { label: string; bg: string; text: string; border: string; next: DelegationStatus }
> = {
  myself: {
    label: '👤 Myself',
    bg: 'bg-stone-100',
    text: 'text-stone-700',
    border: 'border-stone-200',
    next: 'needs_partner',
  },
  needs_partner: {
    label: '🤝 Needs Partner',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    next: 'delegated_partner',
  },
  delegated_partner: {
    label: '➡️ Delegated to Partner',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    next: 'needs_kid',
  },
  needs_kid: {
    label: '🧒 Involve Kid',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    next: 'delegated_kid',
  },
  delegated_kid: {
    label: '➡️ Done by Kid',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    next: 'myself',
  },
};

export const PrioritiesCard: React.FC<PrioritiesCardProps> = ({
  priorities,
  activeMode,
  familyKidsMode = true,
  onAddPriority,
  onTogglePriority,
  onDeletePriority,
  onClearCompleted,
  onUpdatePriority,
  onOpenFullView,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('15 mins');
  const [selectedDelegation, setSelectedDelegation] = useState<DelegationStatus>('myself');
  const [showAddDetails, setShowAddDetails] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [subTaskDrafts, setSubTaskDrafts] = useState<string[]>([]);
  const [newSubTaskInput, setNewSubTaskInput] = useState('');

  // Card view toggle
  const [isDetailedView, setIsDetailedView] = useState(true);

  // Expanded items in compact mode
  const [expandedItemIds, setExpandedItemIds] = useState<Record<number, boolean>>({});

  // Inline subtask drafts for existing items
  const [inlineDrafts, setInlineDrafts] = useState<Record<number, string>>({});

  // Solopreneur / Family Filtered Priorities
  const activePriorities = useMemo(() => {
    return priorities.filter(
      (item) =>
        familyKidsMode ||
        (!item.tags?.includes('Leo') &&
          !item.tags?.includes('Maya') &&
          item.kidTag !== 'Leo' &&
          item.kidTag !== 'Maya' &&
          item.category !== 'FAMILY' &&
          item.category !== 'family' &&
          item.mode !== 'family' &&
          !item.text.toLowerCase().includes('leo') &&
          !item.text.toLowerCase().includes('maya') &&
          !item.text.toLowerCase().includes('science fair'))
    );
  }, [priorities, familyKidsMode]);

  const total = activePriorities.length;
  const completed = activePriorities.filter((p) => p.done).length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleAddSubTaskDraft = () => {
    if (!newSubTaskInput.trim()) return;
    setSubTaskDrafts((prev) => [...prev, newSubTaskInput.trim()]);
    setNewSubTaskInput('');
  };

  const handleRemoveSubTaskDraft = (index: number) => {
    setSubTaskDrafts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const subTasks: PrioritySubTask[] = subTaskDrafts.map((text, idx) => ({
      id: `st-${Date.now()}-${idx}`,
      text,
      done: false,
    }));

    onAddPriority(inputText.trim(), activeMode, {
      duration: selectedDuration,
      delegation: selectedDelegation,
      subTasks: subTasks.length > 0 ? subTasks : undefined,
      recurrence: isRecurring
        ? {
            frequency: 'daily',
            label: 'Daily Habit',
          }
        : undefined,
    });

    setInputText('');
    setSubTaskDrafts([]);
    setShowAddDetails(false);
    setIsRecurring(false);
  };

  // Sub-task handlers on existing items
  const handleToggleSubTask = (item: PriorityItem, subTaskId: string) => {
    if (!onUpdatePriority || !item.subTasks) return;
    const updated = item.subTasks.map((s) => (s.id === subTaskId ? { ...s, done: !s.done } : s));
    onUpdatePriority({ ...item, subTasks: updated });
  };

  const handleAddInlineSubTask = (item: PriorityItem) => {
    const text = inlineDrafts[item.id]?.trim();
    if (!text || !onUpdatePriority) return;

    const newSub: PrioritySubTask = {
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      text,
      done: false,
    };

    onUpdatePriority({
      ...item,
      subTasks: [...(item.subTasks || []), newSub],
    });

    setInlineDrafts((prev) => ({ ...prev, [item.id]: '' }));
  };

  const handleDeleteSubTask = (item: PriorityItem, subTaskId: string) => {
    if (!onUpdatePriority || !item.subTasks) return;
    onUpdatePriority({
      ...item,
      subTasks: item.subTasks.filter((s) => s.id !== subTaskId),
    });
  };

  const handleCycleDelegation = (item: PriorityItem) => {
    if (!onUpdatePriority) return;
    const cycleOrder: DelegationStatus[] = familyKidsMode
      ? ['myself', 'needs_partner', 'needs_kid', 'delegated_partner', 'delegated_kid']
      : ['myself', 'needs_partner', 'delegated_partner'];
    const currIdx = cycleOrder.indexOf(item.delegation || 'myself');
    const next = currIdx >= 0 ? cycleOrder[(currIdx + 1) % cycleOrder.length] : 'myself';
    onUpdatePriority({ ...item, delegation: next });
  };

  return (
    <div
      id="card-priorities"
      className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5 card-print transition-all"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
            <Target className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2
                onClick={onOpenFullView}
                className={`font-serif-heading text-base font-bold text-stone-800 ${
                  onOpenFullView ? 'hover:text-rose-900 cursor-pointer group flex items-center gap-1.5' : ''
                }`}
                title={onOpenFullView ? 'Open Full Priorities Action Board' : undefined}
              >
                <span>Daily Top Priorities</span>
                {onOpenFullView && (
                  <Maximize2 className="w-3.5 h-3.5 text-stone-400 group-hover:text-rose-800 transition-colors" />
                )}
              </h2>
              {activeMode === 'family' && (
                <span className="text-[10px] font-semibold bg-amber-100/70 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                  Family Focus
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400">
              Focus on top critical needles with duration & delegation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Action Board Button */}
          {onOpenFullView && (
            <button
              type="button"
              onClick={onOpenFullView}
              className="no-print inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-950 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 rounded-lg transition-colors cursor-pointer"
              title="Open full-screen Kanban task board with Today, This Week, Backlog, and Time-blocking"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden sm:inline">Action Board</span>
            </button>
          )}

          {/* Detailed View Toggle */}
          <button
            type="button"
            onClick={() => setIsDetailedView((prev) => !prev)}
            className="no-print inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-lg transition-colors"
            title={isDetailedView ? 'Switch to compact view' : 'Expand rich sub-tasks & delegation'}
          >
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">
              {isDetailedView ? 'Detailed' : 'Compact'}
            </span>
          </button>

          {total > 0 && (
            <span className="text-xs font-semibold text-stone-600 px-2 py-0.5 bg-stone-100 rounded-full">
              {completed}/{total} done
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {total > 0 && (
        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mb-3.5">
          <div
            className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Add Priority Form with expandable details */}
      <form onSubmit={handleSubmit} className="no-print mb-3.5 bg-stone-50/60 p-3 rounded-xl border border-stone-200">
        <div className="flex gap-2">
          <input
            id="priorityInput"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              familyKidsMode
                ? "Add must-do priority (e.g. Science fair project materials)..."
                : "Add must-do priority (e.g. Review client pitch proposal)..."
            }
            className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 placeholder:text-stone-400"
          />
          <button
            id="btn-add-priority"
            type="submit"
            disabled={!inputText.trim()}
            className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-white bg-stone-800 hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Add</span>
          </button>
        </div>

        {/* Detailed Fields Toggle */}
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowAddDetails((prev) => !prev)}
            className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-950 font-medium transition-colors"
          >
            {showAddDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>
              {showAddDetails ? 'Hide details (Duration, Delegation, Sub-tasks)' : '+ Add details (Duration, Delegation, 2-3 Step Sub-tasks)'}
            </span>
          </button>

          {subTaskDrafts.length > 0 && (
            <span className="text-[11px] text-stone-500 font-medium">
              {subTaskDrafts.length} steps attached
            </span>
          )}
        </div>

        {/* Detailed Add Drawer */}
        {showAddDetails && (
          <div className="mt-3 pt-3 border-t border-stone-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Duration Tag */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" /> Time-Block Duration
                </label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-700"
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delegation Status */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-blue-600" /> Delegation
                </label>
                <select
                  value={selectedDelegation}
                  onChange={(e) => setSelectedDelegation(e.target.value as DelegationStatus)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-700"
                >
                  <option value="myself">👤 Myself (Sole Owner)</option>
                  <option value="needs_partner">🤝 Needs Partner/Spouse</option>
                  {familyKidsMode && <option value="needs_kid">🧒 Involve Kid</option>}
                  <option value="delegated_partner">➡️ Delegated to Partner</option>
                  {familyKidsMode && <option value="delegated_kid">➡️ Delegated to Kid</option>}
                </select>
              </div>

              {/* Habit / Recurrence */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
                  <Repeat className="w-3 h-3 text-indigo-600" /> Recurring Habit
                </label>
                <button
                  type="button"
                  onClick={() => setIsRecurring((prev) => !prev)}
                  className={`w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border text-left transition-colors ${
                    isRecurring
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-white text-stone-600 border-stone-200'
                  }`}
                >
                  {isRecurring ? '🔁 Repeats Daily' : 'Does not repeat'}
                </button>
              </div>
            </div>

            {/* Sub-tasks builder */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1 flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-emerald-600" /> 2-3 Step Sub-tasks Checklist
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubTaskInput}
                  onChange={(e) => setNewSubTaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubTaskDraft();
                    }
                  }}
                  placeholder="e.g. Step 1: Check inventory; Step 2: Finalize proposal..."
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddSubTaskDraft}
                  disabled={!newSubTaskInput.trim()}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-stone-200 hover:bg-stone-300 disabled:opacity-50 text-stone-700 rounded-lg"
                >
                  + Add Step
                </button>
              </div>

              {subTaskDrafts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {subTaskDrafts.map((step, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-200 rounded-md text-xs text-stone-700"
                    >
                      <span className="font-bold text-amber-700">#{idx + 1}</span>
                      <span>{step}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubTaskDraft(idx)}
                        className="text-stone-400 hover:text-rose-600 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Priorities List */}
      <ul id="priorityList" className="space-y-2">
        {activePriorities.length === 0 ? (
          <li className="py-6 text-center border border-dashed border-stone-100 rounded-xl">
            <p className="text-xs text-stone-400">No priorities added yet. What matters most today?</p>
          </li>
        ) : (
          activePriorities.map((item) => {
            const modeConfig = item.mode ? MODE_CONFIGS[item.mode] : null;
            const isExpanded = isDetailedView || expandedItemIds[item.id];
            const hasSubTasks = item.subTasks && item.subTasks.length > 0;
            const doneSub = item.subTasks?.filter((s) => s.done).length || 0;
            const totalSub = item.subTasks?.length || 0;
            const delConfig = DELEGATION_CONFIG[item.delegation || 'myself'];

            return (
              <li
                key={item.id}
                className={`group rounded-xl border transition-all ${
                  item.done
                    ? 'bg-stone-50/50 border-stone-200/60 opacity-65'
                    : 'bg-white hover:border-stone-300 border-stone-200 shadow-2xs'
                }`}
              >
                {/* Main Row */}
                <div className="flex items-start justify-between gap-2.5 p-3">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onTogglePriority(item.id)}
                      className="shrink-0 text-stone-400 hover:text-stone-700 transition-colors mt-0.5"
                      aria-label={`Toggle priority ${item.text}`}
                    >
                      {item.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`text-xs sm:text-sm select-none ${
                            item.done ? 'line-through text-stone-400' : 'font-semibold text-stone-800'
                          }`}
                        >
                          {item.text}
                        </span>

                        {/* Duration Pill */}
                        {item.duration && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200 rounded"
                            title="Estimated time block"
                          >
                            <Clock className="w-2.5 h-2.5 text-stone-400" />
                            <span>{item.duration}</span>
                          </span>
                        )}

                        {/* Delegation Tag with quick cycle */}
                        {item.delegation && (
                          <button
                            type="button"
                            onClick={() => handleCycleDelegation(item)}
                            title="Click to cycle delegation assignment"
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded border cursor-pointer hover:opacity-80 transition-opacity ${delConfig.bg} ${delConfig.text} ${delConfig.border}`}
                          >
                            <span>{delConfig.label}</span>
                          </button>
                        )}

                        {/* Recurring badge */}
                        {item.recurrence && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded"
                            title="Daily recurring habit"
                          >
                            <Repeat className="w-2.5 h-2.5" />
                            <span>Daily Habit</span>
                          </span>
                        )}
                      </div>

                      {/* Subtasks summary in compact mode */}
                      {!isDetailedView && hasSubTasks && (
                        <div className="mt-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedItemIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 bg-stone-50 hover:bg-stone-100 px-2 py-0.5 rounded border border-stone-200"
                          >
                            <CheckSquare className="w-3 h-3 text-stone-400" />
                            <span>
                              Sub-tasks: {doneSub}/{totalSub} steps
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3 ml-0.5" />
                            ) : (
                              <ChevronDown className="w-3 h-3 ml-0.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions right */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {modeConfig && (
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${modeConfig.badgeBg}`}
                      >
                        {item.mode}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeletePriority(item.id)}
                      className="no-print p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete priority"
                      aria-label={`Delete priority ${item.text}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Sub-Task List Panel */}
                {isExpanded && (
                  <div className="px-3.5 pb-3 pt-1 border-t border-stone-100 bg-stone-50/40 rounded-b-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-semibold text-stone-700">Action Steps</span>
                        {totalSub > 0 && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                              doneSub === totalSub
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {doneSub}/{totalSub} completed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subtask items */}
                    <div className="space-y-1.5 pl-1">
                      {item.subTasks && item.subTasks.length > 0 ? (
                        item.subTasks.map((step) => (
                          <div
                            key={step.id}
                            className="flex items-center justify-between gap-2 group/step text-xs py-0.5"
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleSubTask(item, step.id)}
                              className="flex items-center gap-2 text-left min-w-0 flex-1 hover:text-stone-900"
                            >
                              {step.done ? (
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-stone-400 hover:stroke-stone-700 shrink-0" />
                              )}
                              <span
                                className={`${
                                  step.done ? 'line-through text-stone-400' : 'text-stone-700'
                                }`}
                              >
                                {step.text}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubTask(item, step.id)}
                              className="opacity-0 group-hover/step:opacity-100 text-stone-400 hover:text-rose-600 p-0.5 rounded transition-opacity"
                              title="Delete step"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-stone-400 italic">
                          No sub-steps added yet. Break this needle down into bite-sized actions!
                        </p>
                      )}

                      {/* Add sub-step input */}
                      <div className="no-print flex items-center gap-1.5 pt-1.5">
                        <input
                          type="text"
                          value={inlineDrafts[item.id] || ''}
                          onChange={(e) =>
                            setInlineDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddInlineSubTask(item);
                            }
                          }}
                          placeholder="+ Add step (e.g. Draft proposal, call clinic)..."
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddInlineSubTask(item)}
                          disabled={!inlineDrafts[item.id]?.trim()}
                          className="px-2 py-1 text-xs font-semibold bg-stone-200 hover:bg-stone-300 disabled:opacity-40 text-stone-700 rounded-lg transition-colors"
                        >
                          Add Step
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })
        )}
      </ul>

      {/* Clear Completed Action */}
      {completed > 0 && (
        <div className="no-print mt-3 text-right">
          <button
            type="button"
            onClick={onClearCompleted}
            className="text-xs font-semibold text-stone-400 hover:text-rose-600 transition-colors"
          >
            Clear finished ({completed})
          </button>
        </div>
      )}
    </div>
  );
};
