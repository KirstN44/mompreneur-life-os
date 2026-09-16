import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Clock,
  UserCheck,
  CheckSquare,
  Square,
  Repeat,
  Trash2,
  CheckCircle2,
  Circle,
  Archive,
  ArrowRight,
  ArrowLeft,
  Flame,
  ListTodo,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  PriorityItem,
  PriorityColumn,
  ContextMode,
  DelegationStatus,
  PrioritySubTask,
  FullPageView,
} from '../../types';
import {
  DURATION_PRESETS,
  MODE_CONFIGS,
} from '../../constants';
import { ModuleNavHeader } from './ModuleNavHeader';

const DELEGATION_MAP: Record<
  DelegationStatus,
  { label: string; color: string; next: DelegationStatus }
> = {
  myself: {
    label: '👤 Myself',
    color: 'bg-stone-100 text-stone-700 border-stone-200',
    next: 'needs_partner',
  },
  needs_partner: {
    label: '🤝 Needs Partner',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    next: 'delegated_partner',
  },
  delegated_partner: {
    label: '➡️ Delegated to Partner',
    color: 'bg-blue-50 text-blue-800 border-blue-200',
    next: 'needs_kid',
  },
  needs_kid: {
    label: '🧒 Needs Kid Chore',
    color: 'bg-purple-50 text-purple-800 border-purple-200',
    next: 'delegated_kid',
  },
  delegated_kid: {
    label: '➡️ Done by Kid',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    next: 'myself',
  },
};

interface PrioritiesBoardViewProps {
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
      column?: PriorityColumn;
    }
  ) => void;
  onToggleDone: (id: number) => void;
  onDeletePriority: (id: number) => void;
  onUpdatePriority?: (updated: PriorityItem) => void;
  onBackToDashboard: () => void;
  onSwitchView: (view: FullPageView) => void;
}

export const PrioritiesBoardView: React.FC<PrioritiesBoardViewProps> = ({
  priorities,
  activeMode,
  familyKidsMode = true,
  onAddPriority,
  onToggleDone,
  onDeletePriority,
  onUpdatePriority,
  onBackToDashboard,
  onSwitchView,
}) => {
  // Base Solopreneur / Family Filtered Priorities
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

  // Column definitions
  const columns: { id: PriorityColumn; title: string; subtitle: string; color: string }[] = [
    {
      id: 'today',
      title: "Today's Must-Dos",
      subtitle: 'Critical, needle-moving tasks for today',
      color: 'border-rose-300 bg-rose-50/30',
    },
    {
      id: 'this_week',
      title: "This Week's Focus",
      subtitle: 'Medium-range scheduled projects & errands',
      color: 'border-amber-300 bg-amber-50/30',
    },
    {
      id: 'backlog',
      title: 'Backlog & Someday',
      subtitle: 'Future ideas, nice-to-haves, waiting on others',
      color: 'border-stone-300 bg-stone-50/40',
    },
  ];

  // Quick Task Creator State
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [newColumn, setNewColumn] = useState<PriorityColumn>('today');
  const [newDuration, setNewDuration] = useState('30m');
  const [newDelegation, setNewDelegation] = useState<DelegationStatus>('myself');
  const [newIsHabit, setNewIsHabit] = useState(false);
  const [newSubTasks, setNewSubTasks] = useState<string[]>([]);
  const [subTaskInput, setSubTaskInput] = useState('');

  // Show Completed Archive
  const [showCompletedArchive, setShowCompletedArchive] = useState(false);

  // Group Priorities by Column
  const getColumnTasks = (columnId: PriorityColumn) => {
    return activePriorities.filter((p) => {
      // If no column is set, default first 3 to 'today', others to 'this_week'
      const col = p.column || 'today';
      return col === columnId && !p.done;
    });
  };

  const completedTasks = useMemo(() => {
    return activePriorities.filter((p) => p.done);
  }, [activePriorities]);

  // Compute Total Minutes for a Column
  const calculateColumnTime = (tasks: PriorityItem[]) => {
    let totalMins = 0;
    tasks.forEach((t) => {
      const dur = t.duration || '15m';
      if (dur.includes('5m')) totalMins += 5;
      else if (dur.includes('15m')) totalMins += 15;
      else if (dur.includes('30m')) totalMins += 30;
      else if (dur.includes('45m')) totalMins += 45;
      else if (dur.includes('1h')) totalMins += 60;
      else if (dur.includes('2h')) totalMins += 120;
    });

    if (totalMins < 60) return `${totalMins} mins`;
    const hrs = Math.floor(totalMins / 60);
    const remainder = totalMins % 60;
    return remainder > 0 ? `${hrs}h ${remainder}m` : `${hrs}h`;
  };

  // Move Task Between Columns
  const handleMoveTask = (item: PriorityItem, targetCol: PriorityColumn) => {
    if (!onUpdatePriority) return;
    onUpdatePriority({ ...item, column: targetCol });
  };

  // Toggle Subtask
  const handleToggleSubTask = (item: PriorityItem, subTaskId: string) => {
    if (!onUpdatePriority || !item.subTasks) return;
    const updatedSub = item.subTasks.map((s) =>
      s.id === subTaskId ? { ...s, done: !s.done } : s
    );
    onUpdatePriority({ ...item, subTasks: updatedSub });
  };

  // Cycle Delegation
  const handleCycleDelegation = (item: PriorityItem) => {
    if (!onUpdatePriority) return;
    const cycleOrder: DelegationStatus[] = familyKidsMode
      ? ['myself', 'needs_partner', 'needs_kid', 'delegated_partner', 'delegated_kid']
      : ['myself', 'needs_partner', 'delegated_partner'];
    const currIdx = cycleOrder.indexOf(item.delegation || 'myself');
    const nextStatus = currIdx >= 0 ? cycleOrder[(currIdx + 1) % cycleOrder.length] : 'myself';
    onUpdatePriority({ ...item, delegation: nextStatus });
  };

  // Save New Priority
  const handleSavePriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const subTasksObj: PrioritySubTask[] = newSubTasks.map((t, idx) => ({
      id: `st-${Date.now()}-${idx}`,
      text: t,
      done: false,
    }));

    onAddPriority(newText.trim(), activeMode, {
      duration: newDuration,
      delegation: newDelegation,
      column: newColumn,
      subTasks: subTasksObj.length > 0 ? subTasksObj : undefined,
      recurrence: newIsHabit ? { frequency: 'daily', label: 'Daily Habit' } : undefined,
    });

    setNewText('');
    setNewSubTasks([]);
    setIsCreatorOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#faf7f5] text-stone-800 pb-16">
      {/* Sticky Top Nav Bar */}
      <ModuleNavHeader
        currentView="priorities"
        activeMode={activeMode}
        onBackToDashboard={onBackToDashboard}
        onSwitchView={onSwitchView}
        title="Top Priorities & Action Task Board"
        badgeText={`${priorities.filter((p) => !p.done).length} ACTIVE`}
        onPrint={() => window.print()}
        printLabel="Print Priorities Sheet"
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-4">
        {/* Metric Banner + Controls */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-rose-100/70 text-rose-800 rounded-xl">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-serif-heading font-bold text-rose-950">
                  Priority Action Board
                </h2>
                <p className="text-xs text-stone-500">
                  {familyKidsMode
                    ? 'Time-blocked focus & delegation pipeline for mompreneurs'
                    : 'Time-blocked focus & execution pipeline for founders'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-stone-200 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{priorities.filter((p) => p.done).length} Completed</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCompletedArchive((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                showCompletedArchive
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{showCompletedArchive ? 'Hide Archive' : 'Archive'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreatorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Priority</span>
            </button>
          </div>
        </div>

        {/* 3-Column Kanban Task Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {columns.map((col) => {
            const columnTasks = getColumnTasks(col.id);
            const totalTime = calculateColumnTime(columnTasks);

            return (
              <div
                key={col.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs flex flex-col space-y-3 min-h-[460px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div>
                    <h3 className="font-serif-heading font-bold text-sm text-stone-800">
                      {col.title}
                    </h3>
                    <p className="text-[11px] text-stone-400">{col.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      {columnTasks.length}
                    </span>
                    <div className="text-[10px] text-stone-400 font-semibold mt-0.5">
                      ⏱ {totalTime}
                    </div>
                  </div>
                </div>

                {/* Task List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnTasks.length === 0 ? (
                    <div className="py-12 text-center text-xs text-stone-300 border border-dashed border-stone-200 rounded-xl">
                      No tasks in this column.
                    </div>
                  ) : (
                    columnTasks.map((item) => {
                      const delegInfo =
                        DELEGATION_MAP[item.delegation || 'myself'] || DELEGATION_MAP['myself'];
                      const subTasksDone = item.subTasks?.filter((s) => s.done).length || 0;
                      const subTasksTotal = item.subTasks?.length || 0;

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl border border-stone-200/90 p-3.5 shadow-2xs hover:border-stone-300 transition-all space-y-2.5"
                        >
                          {/* Top Row: Done Toggle + Title + Delete */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() => onToggleDone(item.id)}
                                className="mt-0.5 text-stone-400 hover:text-stone-700"
                              >
                                <Circle className="w-4 h-4 text-stone-400 hover:text-emerald-600" />
                              </button>
                              <span className="text-xs sm:text-sm font-bold text-stone-800 leading-snug">
                                {item.text}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => onDeletePriority(item.id)}
                              className="text-stone-300 hover:text-rose-700 p-0.5"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Badges Row */}
                          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                            {/* Duration Tag */}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                              <Clock className="w-2.5 h-2.5 text-stone-500" />
                              {item.duration || '15m'}
                            </span>

                            {/* Delegation Pill */}
                            <button
                              type="button"
                              onClick={() => handleCycleDelegation(item)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border transition-colors cursor-pointer ${delegInfo.color}`}
                              title="Click to cycle delegation assignment"
                            >
                              <UserCheck className="w-2.5 h-2.5" />
                              <span>{delegInfo.label}</span>
                            </button>

                            {/* Recurrence */}
                            {item.recurrence && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                                <Repeat className="w-2.5 h-2.5" />
                                {item.recurrence.label || 'Daily'}
                              </span>
                            )}
                          </div>

                          {/* Subtasks */}
                          {item.subTasks && item.subTasks.length > 0 && (
                            <div className="pt-2 border-t border-stone-100 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px] font-semibold text-stone-500">
                                <span>Action Steps:</span>
                                <span>
                                  {subTasksDone}/{subTasksTotal}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {item.subTasks.map((st) => (
                                  <button
                                    key={st.id}
                                    type="button"
                                    onClick={() => handleToggleSubTask(item, st.id)}
                                    className="flex items-center gap-1.5 text-xs text-left w-full hover:text-stone-900"
                                  >
                                    {st.done ? (
                                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    ) : (
                                      <Square className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                    )}
                                    <span
                                      className={
                                        st.done ? 'line-through text-stone-400' : 'text-stone-700'
                                      }
                                    >
                                      {st.text}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Column Mover Controls */}
                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                            <span>Move to:</span>
                            <div className="flex items-center gap-1">
                              {col.id !== 'today' && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveTask(item, 'today')}
                                  className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded font-semibold"
                                >
                                  Today
                                </button>
                              )}
                              {col.id !== 'this_week' && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveTask(item, 'this_week')}
                                  className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded font-semibold"
                                >
                                  This Week
                                </button>
                              )}
                              {col.id !== 'backlog' && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveTask(item, 'backlog')}
                                  className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded font-semibold"
                                >
                                  Backlog
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add task to this column shortcut */}
                <button
                  type="button"
                  onClick={() => {
                    setNewColumn(col.id);
                    setIsCreatorOpen(true);
                  }}
                  className="w-full py-2 text-xs font-bold text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl border border-dashed border-stone-200 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to {col.title}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Completed Task Archive Drawer */}
        {showCompletedArchive && (
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3 mt-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-serif-heading font-bold text-stone-800 text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Completed Tasks Archive ({completedTasks.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowCompletedArchive(false)}
                className="text-xs text-stone-400 hover:text-stone-700 font-semibold"
              >
                Close Archive
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {completedTasks.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 col-span-3 text-center">
                  No completed tasks yet. Check off your top priorities to log them here!
                </p>
              ) : (
                completedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between text-xs opacity-75"
                  >
                    <div className="flex items-center gap-2 line-through text-stone-500 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{t.text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleDone(t.id)}
                      className="text-[10px] text-rose-800 font-bold hover:underline shrink-0 ml-2"
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* New Priority Creator Modal */}
      {isCreatorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setIsCreatorOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-stone-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-base font-serif-heading font-bold text-stone-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-800" />
                Add Priority Task
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatorOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePriority} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Priority Name *</label>
                <input
                  type="text"
                  required
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder={
                    familyKidsMode
                      ? 'e.g. Finish sales deck, Batch cooking for kids, Finalize invoice'
                      : 'e.g. Finish sales deck, Client review meeting, Finalize invoice'
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-semibold"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Target Column</label>
                  <select
                    value={newColumn}
                    onChange={(e) => setNewColumn(e.target.value as PriorityColumn)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-semibold"
                  >
                    <option value="today">Today's Must-Dos</option>
                    <option value="this_week">This Week's Focus</option>
                    <option value="backlog">Backlog & Someday</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Time-Block Duration
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-semibold"
                  >
                    {DURATION_PRESETS.map((d) => (
                      <option key={d} value={d}>
                        ⏱ {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Delegation</label>
                  <select
                    value={newDelegation}
                    onChange={(e) => setNewDelegation(e.target.value as DelegationStatus)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
                  >
                    {Object.entries(DELEGATION_MAP)
                      .filter(([k]) => familyKidsMode || !k.includes('kid'))
                      .map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={newIsHabit}
                      onChange={(e) => setNewIsHabit(e.target.checked)}
                      className="rounded text-rose-800"
                    />
                    <span>Mark as Daily Habit</span>
                  </label>
                </div>
              </div>

              {/* Subtasks */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  2–3 Action Checklist Steps
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subTaskInput}
                    onChange={(e) => setSubTaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (subTaskInput.trim()) {
                          setNewSubTasks((prev) => [...prev, subTaskInput.trim()]);
                          setSubTaskInput('');
                        }
                      }
                    }}
                    placeholder="Step 1, Step 2..."
                    className="flex-1 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (subTaskInput.trim()) {
                        setNewSubTasks((prev) => [...prev, subTaskInput.trim()]);
                        setSubTaskInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-lg font-semibold text-stone-700"
                  >
                    + Add
                  </button>
                </div>

                {newSubTasks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {newSubTasks.map((st, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-stone-100 rounded text-stone-700 border border-stone-200"
                      >
                        <span>{st}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setNewSubTasks((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-stone-400 hover:text-rose-700 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreatorOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newText.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 rounded-xl shadow-xs disabled:opacity-50"
                >
                  Save Priority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
