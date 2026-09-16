import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Circle,
  MapPin,
  User,
  Repeat,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Layers,
  Maximize2,
} from 'lucide-react';
import { ContextMode, ScheduleItem, PrepItem, RecurrenceFrequency } from '../types';
import { MODE_CONFIGS, ASSIGNEE_OPTIONS, SOLOPRENEUR_ASSIGNEE_OPTIONS, getTodayDateString } from '../constants';
import {
  generateGCalUrl,
  formatDisplayTime,
  getDirectionsUrl,
  DAYS_OF_WEEK,
  isItemActiveOnDate,
} from '../utils/calendar';

interface ScheduleCardProps {
  activeMode: ContextMode;
  schedule: ScheduleItem[];
  showAllModes: boolean;
  familyKidsMode?: boolean;
  onAddScheduleItem: (
    text: string,
    date: string,
    time: string,
    mode: ContextMode,
    extra?: {
      location?: string;
      assignee?: string;
      prepList?: PrepItem[];
      recurrence?: ScheduleItem['recurrence'];
    }
  ) => void;
  onToggleComplete: (id: number) => void;
  onDeleteScheduleItem: (id: number) => void;
  onUpdateScheduleItem?: (updated: ScheduleItem) => void;
  onOpenFullView?: () => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  activeMode,
  schedule,
  showAllModes,
  familyKidsMode = true,
  onAddScheduleItem,
  onToggleComplete,
  onDeleteScheduleItem,
  onUpdateScheduleItem,
  onOpenFullView,
}) => {
  const [text, setText] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String((Math.ceil(now.getMinutes() / 15) * 15) % 60).padStart(2, '0');
    return `${hours}:${minutes}`;
  });

  // Dynamic state list for assignees
  const [customAssignees, setCustomAssignees] = useState<string[]>(() =>
    familyKidsMode ? [...ASSIGNEE_OPTIONS] : [...SOLOPRENEUR_ASSIGNEE_OPTIONS]
  );

  // Sync available assignees when mode updates
  useEffect(() => {
    setCustomAssignees(familyKidsMode ? [...ASSIGNEE_OPTIONS] : [...SOLOPRENEUR_ASSIGNEE_OPTIONS]);
  }, [familyKidsMode]);

  // Detailed fields in Add Form
  const [showAddDetails, setShowAddDetails] = useState(false);
  const [location, setLocation] = useState('');
  const [assignee, setAssignee] = useState<string>(familyKidsMode ? 'Mom' : 'Me / Primary');
  const [isAddingCustomAssignee, setIsAddingCustomAssignee] = useState(false);
  const [customAssigneeInput, setCustomAssigneeInput] = useState('');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('none');
  const [prepInputs, setPrepInputs] = useState<string[]>([]);
  const [newPrepText, setNewPrepText] = useState('');

  // Sync assignee default when mode changes
  useEffect(() => {
    if (!familyKidsMode && (assignee === 'Mom' || assignee === 'Dad' || assignee === 'Kids' || assignee === 'Grandparents' || assignee === 'Carers')) {
      setAssignee('Me / Primary');
    }
  }, [familyKidsMode, assignee]);

  // Handle saving inline typed custom assignee
  const handleSaveCustomAssignee = () => {
    const trimmed = customAssigneeInput.trim();
    if (trimmed) {
      if (!customAssignees.includes(trimmed)) {
        setCustomAssignees((prev) => [...prev, trimmed]);
      }
      setAssignee(trimmed);
    }
    setCustomAssigneeInput('');
    setIsAddingCustomAssignee(false);
  };

  // Expand / Collapse card view (defaults to expanded)
  const [isDetailedView, setIsDetailedView] = useState<boolean>(true);

  // Date filter view: 'today' | 'all'
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('all');

  // Tracking expanded individual items in compact view
  const [expandedItemIds, setExpandedItemIds] = useState<Record<number, boolean>>({});

  // Inline prep input for existing items
  const [itemPrepDrafts, setItemPrepDrafts] = useState<Record<number, string>>({});

  const activeConfig = MODE_CONFIGS[activeMode] || MODE_CONFIGS['business'];

  const handleToggleItemExpand = (id: number) => {
    setExpandedItemIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddPrepDraft = () => {
    if (!newPrepText.trim()) return;
    setPrepInputs((prev) => [...prev, newPrepText.trim()]);
    setNewPrepText('');
  };

  const handleRemovePrepDraft = (index: number) => {
    setPrepInputs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    let recurrenceRule: ScheduleItem['recurrence'] = undefined;
    if (frequency !== 'none') {
      const selectedDate = new Date(`${date}T12:00:00`);
      const dayIdx = isNaN(selectedDate.getTime()) ? 1 : selectedDate.getDay();
      const dayOfMonth = isNaN(selectedDate.getTime()) ? 1 : selectedDate.getDate();
      const dayName = DAYS_OF_WEEK[dayIdx];

      let label = 'Daily';
      if (frequency === 'weekly') {
        label = `Weekly on ${dayName}s`;
      } else if (frequency === 'monthly') {
        label = `Monthly on the ${dayOfMonth}${
          dayOfMonth === 1 ? 'st' : dayOfMonth === 2 ? 'nd' : dayOfMonth === 3 ? 'rd' : 'th'
        }`;
      }

      recurrenceRule = {
        frequency,
        dayOfWeek: dayIdx,
        dayOfWeekName: dayName,
        dayOfMonth,
        label,
      };
    }

    const prepList: PrepItem[] = prepInputs.map((p, idx) => ({
      id: `p-${Date.now()}-${idx}`,
      text: p,
      done: false,
    }));

    // Use custom input if currently typing
    const finalAssignee = isAddingCustomAssignee && customAssigneeInput.trim()
      ? customAssigneeInput.trim()
      : assignee;

    if (isAddingCustomAssignee && customAssigneeInput.trim()) {
      handleSaveCustomAssignee();
    }

    onAddScheduleItem(text.trim(), date || getTodayDateString(), time || '09:00', activeMode, {
      location: location.trim() || undefined,
      assignee: finalAssignee || undefined,
      prepList: prepList.length > 0 ? prepList : undefined,
      recurrence: recurrenceRule,
    });

    setText('');
    setLocation('');
    setPrepInputs([]);
    setShowAddDetails(false);
    setFrequency('none');
  };

  const handleTogglePrepItem = (item: ScheduleItem, prepId: string) => {
    if (!onUpdateScheduleItem || !item.prepList) return;
    const updatedPrep = item.prepList.map((p) =>
      p.id === prepId ? { ...p, done: !p.done } : p
    );
    onUpdateScheduleItem({ ...item, prepList: updatedPrep });
  };

  const handleAddSubPrepToItem = (item: ScheduleItem) => {
    const draft = itemPrepDrafts[item.id]?.trim();
    if (!draft || !onUpdateScheduleItem) return;

    const newSub: PrepItem = {
      id: `prep-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      text: draft,
      done: false,
    };

    onUpdateScheduleItem({
      ...item,
      prepList: [...(item.prepList || []), newSub],
    });

    setItemPrepDrafts((prev) => ({ ...prev, [item.id]: '' }));
  };

  const handleDeletePrepItem = (item: ScheduleItem, prepId: string) => {
    if (!onUpdateScheduleItem || !item.prepList) return;
    onUpdateScheduleItem({
      ...item,
      prepList: item.prepList.filter((p) => p.id !== prepId),
    });
  };

  const todayStr = getTodayDateString();
  const filteredItems = schedule
    .filter((item) => {
      if (!familyKidsMode) {
        if (item.mode === 'family') return false;
        const lower = (item.text || '').toLowerCase() + ' ' + (item.location || '').toLowerCase();
        if (
          lower.includes('school') ||
          lower.includes('pediatric') ||
          lower.includes('gymnastics') ||
          lower.includes('ballet') ||
          lower.includes('mrs. vance') ||
          lower.includes('maya') ||
          lower.includes('leo') ||
          lower.includes('daycare')
        ) {
          return false;
        }
      }
      return showAllModes || item.mode === activeMode;
    })
    .filter((item) => {
      if (dateFilter === 'today') {
        return isItemActiveOnDate(item, todayStr);
      }
      return true;
    })
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.time.localeCompare(b.time);
    });

  const completedCount = filteredItems.filter((i) => i.completed).length;

  return (
    <div
      id="card-schedule"
      className="bg-white rounded-2xl border border-stone-300 shadow-xs p-4 sm:p-5 card-print transition-all"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-stone-100 text-stone-800 border border-stone-300">
            <CalendarIcon className="w-4 h-4 text-stone-800" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2
                id="scheduleTitle"
                onClick={onOpenFullView}
                className={`font-serif-heading text-base font-bold text-stone-900 ${
                  onOpenFullView ? 'hover:text-stone-700 cursor-pointer group flex items-center gap-1.5' : ''
                }`}
                title={onOpenFullView ? 'Open Full Interactive Planner' : undefined}
              >
                <span>{showAllModes ? 'Unified Daily Timeline' : activeConfig.scheduleTitle}</span>
                {onOpenFullView && (
                  <Maximize2 className="w-3.5 h-3.5 text-stone-500 group-hover:text-stone-900 transition-colors" />
                )}
              </h2>
              {activeMode === 'family' && familyKidsMode && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded-full">
                  Family &amp; Kids Mode
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-stone-600">
              {filteredItems.length === 0
                ? 'No events scheduled'
                : `${completedCount} of ${filteredItems.length} completed`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenFullView && (
            <button
              type="button"
              onClick={onOpenFullView}
              className="no-print inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors cursor-pointer"
              title="Open full-screen interactive physical planner with Day, Week, Month, and Year views"
            >
              <Maximize2 className="w-3.5 h-3.5 text-stone-700" />
              <span className="hidden sm:inline">Full Planner</span>
            </button>
          )}

          <div className="no-print inline-flex p-0.5 bg-stone-100 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700">
            <button
              type="button"
              onClick={() => setDateFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                dateFilter === 'all'
                  ? 'bg-stone-900 font-bold text-white shadow-xs'
                  : 'hover:text-stone-950'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('today')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                dateFilter === 'today'
                  ? 'bg-stone-900 font-bold text-white shadow-xs'
                  : 'hover:text-stone-950'
              }`}
            >
              Today
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsDetailedView((prev) => !prev)}
            className="no-print inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors"
            title={isDetailedView ? 'Switch to compact view' : 'Expand rich detail fields'}
          >
            <Layers className="w-3.5 h-3.5 text-stone-700" />
            <span className="hidden sm:inline">
              {isDetailedView ? 'Detailed View' : 'Compact View'}
            </span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="no-print mb-4 bg-stone-50 p-3 rounded-xl border border-stone-300">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="scheduleText"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              familyKidsMode
                ? 'Event title (e.g. School pickup, doctor appointment, project sprint)...'
                : 'Event title (e.g. Client call, contract review, invoicing sprint)...'
            }
            className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 placeholder:text-stone-500 text-stone-900 font-medium"
          />

          <div className="flex gap-2">
            <input
              id="scheduleDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Event date"
              className="px-2.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-500/20 text-stone-800 font-medium"
            />

            <input
              id="scheduleTime"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-label="Event time"
              className="px-2.5 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-500/20 text-stone-800 font-medium"
            />

            <button
              id="btn-add-schedule"
              type="submit"
              disabled={!text.trim()}
              className="inline-flex items-center justify-center gap-1 px-4 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowAddDetails((prev) => !prev)}
            className="inline-flex items-center gap-1 text-stone-800 hover:text-stone-950 font-bold transition-colors"
          >
            {showAddDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>
              {showAddDetails ? 'Hide details (Location, Checklist, Assignee, Repeat)' : '+ Add details (Location, Checklist, Assignee, Repeat)'}
            </span>
          </button>

          {prepInputs.length > 0 && (
            <span className="text-xs text-stone-700 font-bold">
              {prepInputs.length} prep items attached
            </span>
          )}
        </div>

        {showAddDetails && (
          <div className="mt-3 pt-3 border-t border-stone-300 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-stone-700" /> Location / Directions
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={familyKidsMode ? 'e.g. Oakridge Elementary, Gate B' : 'e.g. Client Office / Zoom Link'}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-stone-700" /> Assignee
                </label>
                {isAddingCustomAssignee ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      autoFocus
                      value={customAssigneeInput}
                      onChange={(e) => setCustomAssigneeInput(e.target.value)}
                      placeholder="Type name..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveCustomAssignee();
                        }
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomAssignee}
                      className="px-2 py-1 text-xs font-bold bg-stone-900 text-white rounded-lg shrink-0 hover:bg-stone-800 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomAssignee(false)}
                      className="px-1 text-xs text-stone-500 hover:text-stone-800 font-bold shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <select
                    value={assignee}
                    onChange={(e) => {
                      if (e.target.value === 'ADD_NEW') {
                        setIsAddingCustomAssignee(true);
                      } else {
                        setAssignee(e.target.value);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900 font-medium"
                  >
                    {customAssignees.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    <option value="ADD_NEW">+ Type custom name...</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1">
                  <Repeat className="w-3 h-3 text-stone-700" /> Recurrence / Repeat
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900 font-medium"
                >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly (selected day)</option>
                  <option value="monthly">Monthly (selected date)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center gap-1">
                <CheckSquare className="w-3 h-3 text-emerald-700" /> Checklist &amp; Prep items
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPrepText}
                  onChange={(e) => setNewPrepText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPrepDraft();
                    }
                  }}
                  placeholder={familyKidsMode ? 'e.g. Pack water bottle, sign permission slip...' : 'e.g. Review slide deck, prepare invoice draft...'}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900"
                />
                <button
                  type="button"
                  onClick={handleAddPrepDraft}
                  disabled={!newPrepText.trim()}
                  className="px-3 py-1.5 text-xs font-bold bg-stone-200 hover:bg-stone-300 disabled:opacity-50 text-stone-900 rounded-lg transition-colors"
                >
                  + Add Item
                </button>
              </div>

              {prepInputs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {prepInputs.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-300 rounded-md text-xs font-semibold text-stone-800"
                    >
                      <CheckSquare className="w-3 h-3 text-emerald-700" />
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePrepDraft(idx)}
                        className="text-stone-500 hover:text-stone-900 font-bold ml-1"
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

      <div id="scheduleContainer" className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
            <Clock className="w-8 h-8 text-stone-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-stone-700">
              {dateFilter === 'today' ? 'No events scheduled for today.' : 'No time blocks scheduled yet.'}
            </p>
            <p className="text-xs text-stone-600 mt-0.5">
              Add an event above or switch contexts to plan your timeline.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const itemConfig = MODE_CONFIGS[item.mode] || activeConfig;
            const isExpanded = isDetailedView || expandedItemIds[item.id];
            const hasPrepList = item.prepList && item.prepList.length > 0;
            const completedPrep = item.prepList?.filter((p) => p.done).length || 0;
            const totalPrep = item.prepList?.length || 0;
            const allPrepDone = totalPrep > 0 && completedPrep === totalPrep;

            return (
              <div
                key={item.id}
                className={`group rounded-xl border transition-all ${
                  item.completed
                    ? 'bg-stone-50 border-stone-300 opacity-60'
                    : 'bg-white hover:border-stone-400 border-stone-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3 p-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleComplete(item.id)}
                      className="text-stone-500 hover:text-stone-900 transition-colors shrink-0 mt-0.5 cursor-pointer"
                      title={item.completed ? 'Mark incomplete' : 'Mark complete'}
                      aria-label={`Mark event "${item.text}" as ${item.completed ? 'incomplete' : 'complete'}`}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 fill-emerald-100" />
                      ) : (
                        <Circle className="w-4 h-4 hover:stroke-stone-900" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4
                          className={`text-xs sm:text-sm font-bold ${
                            item.completed ? 'line-through text-stone-500' : 'text-stone-900'
                          }`}
                        >
                          {item.text}
                        </h4>

                        {item.recurrence && item.recurrence.frequency !== 'none' && (
                          <span
                            title={item.recurrence.label || `Repeats ${item.recurrence.frequency}`}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-300 rounded"
                          >
                            <Repeat className="w-2.5 h-2.5" />
                            <span>{item.recurrence.label || item.recurrence.frequency}</span>
                          </span>
                        )}

                        {item.assignee && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold bg-stone-100 text-stone-800 border border-stone-300 rounded"
                            title={`Handled by: ${item.assignee}`}
                          >
                            <User className="w-2.5 h-2.5 text-stone-700" />
                            <span>{item.assignee}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-stone-700 font-medium">
                        <span className="flex items-center gap-1 font-bold text-stone-900">
                          <Clock className="w-3 h-3 text-stone-600" />
                          {formatDisplayTime(item.time)}
                        </span>
                        <span>•</span>
                        <span>{item.date}</span>

                        {item.location && (
                          <>
                            <span>•</span>
                            <a
                              href={getDirectionsUrl(item.location, item.mapLink)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open Google Maps directions in new tab"
                              className="inline-flex items-center gap-1 text-stone-800 hover:text-stone-950 font-bold hover:underline"
                            >
                              <MapPin className="w-3 h-3 text-stone-600" />
                              <span className="truncate max-w-[200px]">{item.location}</span>
                            </a>
                          </>
                        )}
                      </div>

                      {!isDetailedView && hasPrepList && (
                        <div className="mt-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleItemExpand(item.id)}
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border transition-colors ${
                              allPrepDone
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200'
                            }`}
                          >
                            <CheckSquare className="w-3 h-3" />
                            <span>
                              Prep Checklist: {completedPrep}/{totalPrep} ready
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

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={generateGCalUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Add directly to Google Calendar"
                      className="no-print inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-sky-50 text-sky-900 hover:bg-sky-100 border border-sky-300 rounded-md transition-colors"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span>+ Cal</span>
                    </a>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${itemConfig.badgeBg}`}
                    >
                      {item.mode}
                    </span>

                    <button
                      type="button"
                      onClick={() => onDeleteScheduleItem(item.id)}
                      title="Delete item"
                      aria-label={`Delete event ${item.text}`}
                      className="no-print p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3.5 pb-3 pt-1 border-t border-stone-300 bg-stone-50 rounded-b-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-stone-700" />
                        <span className="text-xs font-bold text-stone-900">
                          Checklist &amp; Prep Notes
                        </span>
                        {totalPrep > 0 && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                              allPrepDone
                                ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                : 'bg-stone-200 text-stone-800 border-stone-300'
                            }`}
                          >
                            {completedPrep}/{totalPrep} ready
                          </span>
                        )}
                      </div>

                      {item.location && (
                        <a
                          href={getDirectionsUrl(item.location, item.mapLink)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-print inline-flex items-center gap-1 text-xs font-bold text-stone-800 hover:underline"
                        >
                          <MapPin className="w-3 h-3 text-stone-600" />
                          <span>Get Directions</span>
                        </a>
                      )}
                    </div>

                    <div className="space-y-1.5 pl-1">
                      {item.prepList && item.prepList.length > 0 ? (
                        item.prepList.map((prep) => (
                          <div
                            key={prep.id}
                            className="flex items-center justify-between gap-2 group/prep text-xs py-0.5"
                          >
                            <button
                              type="button"
                              onClick={() => handleTogglePrepItem(item, prep.id)}
                              className="flex items-center gap-2 text-left min-w-0 flex-1 hover:text-stone-950 font-medium"
                            >
                              {prep.done ? (
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-stone-500 hover:stroke-stone-900 shrink-0" />
                              )}
                              <span
                                className={`${
                                  prep.done ? 'line-through text-stone-500' : 'text-stone-900'
                                }`}
                              >
                                {prep.text}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePrepItem(item, prep.id)}
                              className="opacity-0 group-hover/prep:opacity-100 text-stone-500 hover:text-stone-900 p-0.5 rounded transition-opacity"
                              title="Delete sub-item"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-stone-600 italic">
                          No prep items added yet (e.g. review agenda, prepare attachments, notes).
                        </p>
                      )}

                      <div className="no-print flex items-center gap-1.5 pt-1.5">
                        <input
                          type="text"
                          value={itemPrepDrafts[item.id] || ''}
                          onChange={(e) =>
                            setItemPrepDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubPrepToItem(item);
                            }
                          }}
                          placeholder="+ Add prep checklist item..."
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSubPrepToItem(item)}
                          disabled={!itemPrepDrafts[item.id]?.trim()}
                          className="px-2.5 py-1 text-xs font-bold bg-stone-200 hover:bg-stone-300 disabled:opacity-40 text-stone-900 rounded-lg transition-colors cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};