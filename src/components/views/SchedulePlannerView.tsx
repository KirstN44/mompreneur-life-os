import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  ExternalLink,
  UserCheck,
  CheckSquare,
  Square,
  Repeat,
  Share2,
  Trash2,
  CheckCircle2,
  Circle,
  Filter,
  Layers,
  Sparkles,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  User,
} from 'lucide-react';
import {
  ScheduleItem,
  ContextMode,
  Assignee,
  PrepItem,
  ScheduleViewMode,
  FullPageView,
} from '../../types';
import {
  DAYS_OF_WEEK,
  formatDisplayTime,
  generateGCalUrl,
  getDirectionsUrl,
  isItemActiveOnDate,
} from '../../utils/calendar';
import {
  MODE_CONFIGS,
  RECURRENCE_OPTIONS,
} from '../../constants';
import { ModuleNavHeader } from './ModuleNavHeader';

interface SchedulePlannerViewProps {
  schedule: ScheduleItem[];
  activeMode: ContextMode;
  familyKidsMode?: boolean;
  onAddScheduleItem: (
    text: string,
    date: string,
    time: string,
    mode: ContextMode,
    extra?: {
      location?: string;
      assignee?: Assignee;
      prepList?: PrepItem[];
      recurrence?: ScheduleItem['recurrence'];
    }
  ) => void;
  onToggleComplete: (id: number) => void;
  onDeleteScheduleItem: (id: number) => void;
  onUpdateScheduleItem?: (updated: ScheduleItem) => void;
  onBackToDashboard: () => void;
  onSwitchView: (view: FullPageView) => void;
}

export const SchedulePlannerView: React.FC<SchedulePlannerViewProps> = ({
  schedule,
  activeMode,
  familyKidsMode = true,
  onAddScheduleItem,
  onToggleComplete,
  onDeleteScheduleItem,
  onUpdateScheduleItem,
  onBackToDashboard,
  onSwitchView,
}) => {
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('week');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('all');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState<string>('all');

  // Holds user-added custom assignees across the session (No preloaded defaults)
  const [customAssignees, setCustomAssignees] = useState<string[]>([]);

  // Dynamically aggregate custom typed assignees + any existing assignees on schedule items
  const assigneeOptions = useMemo(() => {
    const existingFromSchedule = schedule
      .map((item) => item.assignee)
      .filter((a): a is string => Boolean(a));
    
    const combined = Array.from(
      new Set([...customAssignees, ...existingFromSchedule])
    ).filter((a) => a.trim().length > 0);

    return combined;
  }, [customAssignees, schedule]);

  // Modal State for new event
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [modalTime, setModalTime] = useState('09:00');
  const [modalText, setModalText] = useState('');
  const [modalMode, setModalMode] = useState<ContextMode>(
    !familyKidsMode && activeMode === 'family' ? 'business' : activeMode
  );
  const [modalLocation, setModalLocation] = useState('');
  const [modalAssignee, setModalAssignee] = useState<string>('');

  const [modalRecurrence, setModalRecurrence] = useState<string>('none');
  const [modalPrepList, setModalPrepList] = useState<string[]>([]);
  const [newPrepInput, setNewPrepInput] = useState('');

  // Selected Day in Month/Year view
  const [selectedDayEvents, setSelectedDayEvents] = useState<string | null>(null);

  // Keep modal mode valid when mode changes
  useEffect(() => {
    if (!familyKidsMode) {
      if (modalMode === 'family') setModalMode('business');
      if (selectedModeFilter === 'family') setSelectedModeFilter('all');
    }
  }, [familyKidsMode]);

  // Helper date strings
  const currentDateStr = currentDate.toISOString().split('T')[0];
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === 'day') next.setDate(next.getDate() - 1);
      else if (viewMode === 'week') next.setDate(next.getDate() - 7);
      else if (viewMode === 'month') next.setMonth(next.getMonth() - 1);
      else if (viewMode === 'year') next.setFullYear(next.getFullYear() - 1);
      return next;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === 'day') next.setDate(next.getDate() + 1);
      else if (viewMode === 'week') next.setDate(next.getDate() + 7);
      else if (viewMode === 'month') next.setMonth(next.getMonth() + 1);
      else if (viewMode === 'year') next.setFullYear(next.getFullYear() - 1);
      return next;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Compute Week Range (Monday to Sunday)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const day = curr.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + diffToMon);

    const days: { date: Date; dateStr: string; dayName: string; dayNum: number; isToday: boolean }[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr: dStr,
        dayName: DAYS_OF_WEEK[d.getDay()].substring(0, 3),
        dayNum: d.getDate(),
        isToday: dStr === todayStr,
      });
    }
    return days;
  }, [currentDate]);

  // Compute Month Matrix
  const monthMatrix = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const matrix: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dNum = prevMonthLastDay - i;
      const pDate = new Date(currentYear, currentMonth - 1, dNum);
      const dStr = pDate.toISOString().split('T')[0];
      matrix.push({ dateStr: dStr, dayNum: dNum, isCurrentMonth: false, isToday: dStr === todayStr });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const cDate = new Date(currentYear, currentMonth, i);
      const dStr = cDate.toISOString().split('T')[0];
      matrix.push({ dateStr: dStr, dayNum: i, isCurrentMonth: true, isToday: dStr === todayStr });
    }

    // Next month padding
    const remaining = (7 - (matrix.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nDate = new Date(currentYear, currentMonth + 1, i);
      const dStr = nDate.toISOString().split('T')[0];
      matrix.push({ dateStr: dStr, dayNum: i, isCurrentMonth: false, isToday: dStr === todayStr });
    }

    return matrix;
  }, [currentYear, currentMonth]);

  // Filter items
  const filterSchedule = (items: ScheduleItem[]) => {
    return items.filter((item) => {
      if (!familyKidsMode) {
        if (item.mode === 'family') return false;
        const lowerText = (item.text || '').toLowerCase();
        const lowerLoc = (item.location || '').toLowerCase();
        const isFamilySpecific =
          lowerText.includes('school') ||
          lowerText.includes('pediatric') ||
          lowerText.includes('gymnastics') ||
          lowerText.includes('ballet') ||
          lowerText.includes('mrs. vance') ||
          lowerText.includes('maya') ||
          lowerText.includes('leo') ||
          lowerText.includes('daycare') ||
          lowerLoc.includes('school') ||
          lowerLoc.includes('pediatric') ||
          lowerLoc.includes('gymnastics') ||
          lowerLoc.includes('ballet') ||
          lowerLoc.includes('daycare');
        if (isFamilySpecific) return false;
      }
      if (selectedModeFilter !== 'all' && item.mode !== selectedModeFilter) return false;
      if (selectedAssigneeFilter !== 'all' && selectedAssigneeFilter.trim() !== '') {
        if (!item.assignee || item.assignee.toLowerCase() !== selectedAssigneeFilter.toLowerCase()) return false;
      }
      return true;
    });
  };

  // Get items for a given date taking recurrence into account
  const getItemsForDate = (dateStr: string) => {
    const filtered = filterSchedule(schedule);
    return filtered
      .filter((item) => isItemActiveOnDate(item, dateStr))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  // Subtask toggles
  const handleTogglePrepItem = (item: ScheduleItem, prepId: string) => {
    if (!onUpdateScheduleItem || !item.prepList) return;
    const updated = item.prepList.map((p) => (p.id === prepId ? { ...p, done: !p.done } : p));
    onUpdateScheduleItem({ ...item, prepList: updated });
  };

  // Add event submission
  const handleSaveModalEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalText.trim()) return;

    const prepListObj: PrepItem[] = modalPrepList.map((t, idx) => ({
      id: `p-${Date.now()}-${idx}`,
      text: t,
      done: false,
    }));

    const recurrenceRule =
      modalRecurrence !== 'none'
        ? {
            frequency: modalRecurrence as any,
            label:
              RECURRENCE_OPTIONS.find((r) => r.value === modalRecurrence)?.label ||
              modalRecurrence,
          }
        : undefined;

    const finalAssignee = modalAssignee.trim();

    // Store custom assignee if entered
    if (finalAssignee && !customAssignees.some((a) => a.toLowerCase() === finalAssignee.toLowerCase())) {
      setCustomAssignees((prev) => [...prev, finalAssignee]);
    }

    onAddScheduleItem(modalText.trim(), modalDate, modalTime, modalMode, {
      location: modalLocation.trim() || undefined,
      assignee: (finalAssignee as Assignee) || undefined,
      prepList: prepListObj.length > 0 ? prepListObj : undefined,
      recurrence: recurrenceRule,
    });

    setIsAddModalOpen(false);
    setModalText('');
    setModalLocation('');
    setModalAssignee('');
    setModalPrepList([]);
  };

  const handleOpenAddForDate = (dateStr: string, timeStr = '09:00') => {
    setModalDate(dateStr);
    setModalTime(timeStr);
    setModalMode(!familyKidsMode && activeMode === 'family' ? 'business' : activeMode);
    setModalAssignee('');
    setIsAddModalOpen(true);
  };

  // Date Header Title
  const headerTitle = useMemo(() => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    if (viewMode === 'week') {
      const first = weekDays[0].date;
      const last = weekDays[6].date;
      return `${first.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} – ${last.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return `Annual Planner ${currentYear}`;
  }, [viewMode, currentDate, weekDays, currentYear]);

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 pb-16">
      {/* Sticky Top Nav Bar */}
      <ModuleNavHeader
        currentView="schedule"
        activeMode={activeMode}
        onBackToDashboard={onBackToDashboard}
        onSwitchView={onSwitchView}
        title={familyKidsMode ? 'Family Schedule & Interactive Planner' : 'Master Schedule & Interactive Planner'}
        badgeText={viewMode.toUpperCase() + ' VIEW'}
        onPrint={() => window.print()}
        printLabel="Print Schedule Sheet"
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-4">
        {/* Planner Controls Bar */}
        <div className="bg-white rounded-2xl border border-stone-300 p-4 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-300">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 hover:bg-white rounded-lg text-stone-700 transition-colors cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-bold text-stone-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 hover:bg-white rounded-lg text-stone-700 transition-colors cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-base sm:text-lg font-serif-heading font-bold text-stone-950">
              {headerTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-300">
              {(['day', 'week', 'month', 'year'] as ScheduleViewMode[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setViewMode(v)}
                  className={`px-3 py-1 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer ${
                    viewMode === v
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <select
              aria-label="Filter context mode"
              value={selectedModeFilter}
              onChange={(e) => setSelectedModeFilter(e.target.value)}
              className="text-xs font-bold px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 cursor-pointer"
            >
              <option value="all">All Modes</option>
              {familyKidsMode && <option value="family">Family</option>}
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
              <option value="self">Self Care</option>
            </select>

            {/* Custom Interactive Assignee Filter */}
            <div className="relative">
              <input
                type="text"
                list="full-page-assignee-filter-list"
                value={selectedAssigneeFilter === 'all' ? '' : selectedAssigneeFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    setSelectedAssigneeFilter('all');
                  } else {
                    setSelectedAssigneeFilter(val);
                    if (!customAssignees.some((a) => a.toLowerCase() === val.toLowerCase())) {
                      setCustomAssignees((prev) => [...prev, val]);
                    }
                  }
                }}
                placeholder="All Assignees"
                className="text-xs font-bold px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 w-36 cursor-pointer"
              />
              <datalist id="full-page-assignee-filter-list">
                {assigneeOptions.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddForDate(currentDateStr)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Event</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: DAY TIMELINE VIEW */}
        {viewMode === 'day' && (
          <div className="bg-white rounded-2xl border border-stone-300 p-4 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  Daily Time-Blocking
                </span>
                <h3 className="text-lg font-bold text-stone-950">
                  {currentDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-stone-100 border border-stone-300 rounded-full text-stone-800">
                {getItemsForDate(currentDateStr).length} Events Scheduled
              </span>
            </div>

            <div className="space-y-3">
              {Array.from({ length: 16 }).map((_, idx) => {
                const hour = idx + 6;
                const hourStr = String(hour).padStart(2, '0') + ':00';
                const displayH = hour % 12 === 0 ? 12 : hour % 12;
                const ampm = hour >= 12 ? 'PM' : 'AM';

                const hourItems = getItemsForDate(currentDateStr).filter((item) => {
                  const itemH = parseInt(item.time.split(':')[0], 10);
                  return itemH === hour;
                });

                return (
                  <div
                    key={hour}
                    className="flex items-start gap-3 py-2 border-b border-stone-100 group/hour hover:bg-stone-50/70 rounded-xl px-2 transition-colors"
                  >
                    <div className="w-16 shrink-0 text-right pt-1">
                      <span className="text-xs font-bold text-stone-600 font-mono">
                        {displayH}:00 <span className="text-[10px] text-stone-500">{ampm}</span>
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 min-h-[36px]">
                      {hourItems.length > 0 ? (
                        hourItems.map((item) => {
                          const config = MODE_CONFIGS[item.mode];
                          const gcalUrl = generateGCalUrl(item);
                          const directionsUrl = item.location
                            ? getDirectionsUrl(item.location, item.mapLink)
                            : null;

                          return (
                            <div
                              key={item.id}
                              className={`p-3 rounded-xl border transition-all ${
                                item.completed
                                  ? 'bg-stone-50 border-stone-200 opacity-60'
                                  : 'bg-white border-stone-300 hover:border-stone-400 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => onToggleComplete(item.id)}
                                    className="mt-0.5 text-stone-400 hover:text-stone-800 cursor-pointer"
                                  >
                                    {item.completed ? (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                                    ) : (
                                      <Circle className="w-4 h-4" />
                                    )}
                                  </button>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span
                                        className={`text-sm font-bold ${
                                          item.completed
                                            ? 'line-through text-stone-400'
                                            : 'text-stone-900'
                                        }`}
                                      >
                                        {item.text}
                                      </span>
                                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-800">
                                        {formatDisplayTime(item.time)}
                                      </span>
                                      <span
                                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${config.badgeBg}`}
                                      >
                                        {item.mode}
                                      </span>
                                      {item.assignee && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-300 flex items-center gap-1">
                                          <span>👤</span>
                                          <span>{item.assignee}</span>
                                        </span>
                                      )}
                                      {item.recurrence && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                                          <Repeat className="w-2.5 h-2.5" />
                                          {item.recurrence.label || item.recurrence.frequency}
                                        </span>
                                      )}
                                    </div>

                                    {item.location && directionsUrl && (
                                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-stone-700">
                                        <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-500" />
                                        <span className="font-medium">{item.location}</span>
                                        <a
                                          href={directionsUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-0.5 text-indigo-700 hover:text-indigo-900 underline font-semibold ml-1"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          Directions
                                        </a>
                                      </div>
                                    )}

                                    {item.prepList && item.prepList.length > 0 && (
                                      <div className="mt-2 pt-2 border-t border-stone-200 space-y-1">
                                        <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                                          Prep / Action Items:
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                          {item.prepList.map((prep) => (
                                            <button
                                              key={prep.id}
                                              type="button"
                                              onClick={() => handleTogglePrepItem(item, prep.id)}
                                              className="flex items-center gap-1.5 text-xs text-left hover:text-stone-950 cursor-pointer"
                                            >
                                              {prep.done ? (
                                                <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                              ) : (
                                                <Square className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                              )}
                                              <span
                                                className={
                                                  prep.done
                                                    ? 'line-through text-stone-400'
                                                    : 'text-stone-800 font-medium'
                                                }
                                              >
                                                {prep.text}
                                              </span>
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <a
                                    href={gcalUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                                    title="Add to Google Calendar"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteScheduleItem(item.id)}
                                    className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete event"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenAddForDate(currentDateStr, hourStr)}
                          className="opacity-0 group-hover/hour:opacity-100 inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-opacity py-1 px-2 rounded-lg hover:bg-white border border-transparent hover:border-stone-300 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add time block at {displayH}:00 {ampm}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: 7-DAY WEEK PLANNER VIEW */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const dayItems = getItemsForDate(day.dateStr);

              return (
                <div
                  key={day.dateStr}
                  className={`rounded-2xl border p-3 flex flex-col min-h-[380px] transition-all ${
                    day.isToday
                      ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-white border-stone-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200">
                    <div>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          day.isToday ? 'text-amber-900' : 'text-stone-600'
                        }`}
                      >
                        {day.dayName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-lg font-bold font-serif-heading ${
                            day.isToday ? 'text-stone-950 font-extrabold' : 'text-stone-900'
                          }`}
                        >
                          {day.dayNum}
                        </span>
                        {day.isToday && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-amber-200/90 text-amber-950 rounded">
                            Today
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAddForDate(day.dateStr)}
                      className="p-1 hover:bg-stone-100 text-stone-500 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
                      title={`Add event for ${day.dayName}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {dayItems.length === 0 ? (
                      <div className="h-full flex items-center justify-center py-8 text-center text-[11px] text-stone-400">
                        No events
                      </div>
                    ) : (
                      dayItems.map((item) => {
                        const config = MODE_CONFIGS[item.mode];
                        return (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-xl border text-xs transition-all ${
                              item.completed
                                ? 'bg-stone-50 border-stone-200 opacity-60'
                                : 'bg-white border-stone-300 shadow-2xs hover:border-stone-400'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-mono text-[10px] font-bold text-stone-600">
                                {formatDisplayTime(item.time)}
                              </span>
                              <div className="flex items-center gap-1">
                                <span
                                  className={`text-[8px] font-bold uppercase px-1 rounded ${config.badgeBg}`}
                                >
                                  {item.mode.substring(0, 3)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onDeleteScheduleItem(item.id)}
                                  className="text-stone-400 hover:text-rose-600 p-0.5 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <p
                              onClick={() => onToggleComplete(item.id)}
                              className={`font-bold mt-1 leading-snug cursor-pointer ${
                                item.completed ? 'line-through text-stone-400' : 'text-stone-900'
                              }`}
                            >
                              {item.text}
                            </p>

                            <div className="mt-1.5 flex flex-wrap gap-1 text-[9px]">
                              {item.assignee && (
                                <span className="px-1.5 py-0.5 bg-stone-100 text-stone-800 border border-stone-200 rounded font-bold inline-flex items-center gap-1">
                                  <span>👤</span>
                                  <span>{item.assignee}</span>
                                </span>
                              )}
                              {item.location && (
                                <span className="px-1.5 py-0.5 bg-stone-100 text-stone-700 border border-stone-200 rounded truncate max-w-[120px]">
                                  📍 {item.location}
                                </span>
                              )}
                            </div>

                            {item.prepList && item.prepList.length > 0 && (
                              <div className="mt-2 pt-1.5 border-t border-stone-200 text-[10px] space-y-1">
                                <div className="font-bold text-stone-600 flex justify-between">
                                  <span>Prep Checklist</span>
                                  <span>
                                    {item.prepList.filter((p) => p.done).length}/{item.prepList.length}
                                  </span>
                                </div>
                                {item.prepList.map((prep) => (
                                  <button
                                    key={prep.id}
                                    type="button"
                                    onClick={() => handleTogglePrepItem(item, prep.id)}
                                    className="flex items-center gap-1 w-full text-left hover:text-stone-900 cursor-pointer text-[10px]"
                                  >
                                    {prep.done ? (
                                      <CheckSquare className="w-3 h-3 text-emerald-600 shrink-0" />
                                    ) : (
                                      <Square className="w-3 h-3 text-stone-400 shrink-0" />
                                    )}
                                    <span className={prep.done ? 'line-through text-stone-400' : 'text-stone-800'}>
                                      {prep.text}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 3: FULL MONTH CALENDAR MATRIX */}
        {viewMode === 'month' && (
          <div className="bg-white rounded-2xl border border-stone-300 p-4 shadow-2xs">
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-stone-600 pb-2 border-b border-stone-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d}>
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 pt-2">
              {monthMatrix.map((cell, idx) => {
                const dayItems = getItemsForDate(cell.dateStr);

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDayEvents(cell.dateStr)}
                    className={`min-h-[105px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      cell.isToday
                        ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300'
                        : cell.isCurrentMonth
                        ? 'bg-white border-stone-300 hover:border-stone-400 hover:bg-stone-50/50 shadow-2xs'
                        : 'bg-stone-50/50 border-stone-200 text-stone-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold font-serif-heading ${
                          cell.isToday
                            ? 'text-stone-950 font-extrabold'
                            : cell.isCurrentMonth
                            ? 'text-stone-900'
                            : 'text-stone-400'
                        }`}
                      >
                        {cell.dayNum}
                      </span>

                      {dayItems.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-800">
                          {dayItems.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayItems.slice(0, 3).map((it) => (
                        <div
                          key={it.id}
                          className="truncate text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200"
                        >
                          {formatDisplayTime(it.time)} {it.text}
                        </div>
                      ))}
                      {dayItems.length > 3 && (
                        <span className="text-[9px] font-bold text-stone-500 pl-1">
                          +{dayItems.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddForDate(cell.dateStr);
                        }}
                        className="text-[10px] text-stone-500 hover:text-stone-950 opacity-0 group-hover:opacity-100 font-bold cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 4: YEAR OVERVIEW */}
        {viewMode === 'year' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, mIdx) => {
                const monthDate = new Date(currentYear, mIdx, 1);
                const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' });
                const daysInM = new Date(currentYear, mIdx + 1, 0).getDate();

                const monthEvents = schedule.filter((s) => {
                  const sD = new Date(s.date);
                  return sD.getFullYear() === currentYear && sD.getMonth() === mIdx;
                });

                return (
                  <div
                    key={mIdx}
                    className="bg-white rounded-2xl border border-stone-300 p-3.5 shadow-2xs hover:border-stone-400 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-serif-heading font-bold text-sm text-stone-900">
                        {monthName}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                        {monthEvents.length} events
                      </span>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-stone-500 font-mono py-1 border-t border-stone-200">
                      {Array.from({ length: daysInM }).map((_, dIdx) => {
                        const dNum = dIdx + 1;
                        const dStr = `${currentYear}-${String(mIdx + 1).padStart(2, '0')}-${String(
                          dNum
                        ).padStart(2, '0')}`;
                        const hasEvents = getItemsForDate(dStr).length > 0;

                        return (
                          <div
                            key={dNum}
                            onClick={() => {
                              setCurrentDate(new Date(currentYear, mIdx, dNum));
                              setViewMode('day');
                            }}
                            className={`p-1 rounded cursor-pointer transition-colors ${
                              hasEvents
                                ? 'bg-stone-900 text-white font-bold'
                                : 'hover:bg-stone-100 text-stone-700'
                            }`}
                            title={hasEvents ? `${getItemsForDate(dStr).length} events` : undefined}
                          >
                            {dNum}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Day Drawer in Month View */}
        {selectedDayEvents && (
          <div className="bg-white rounded-2xl border border-stone-300 p-4 shadow-2xs mt-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Events on{' '}
                  {new Date(`${selectedDayEvents}T12:00:00`).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAddForDate(selectedDayEvents)}
                  className="px-3 py-1 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer"
                >
                  + Add Event
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDayEvents(null)}
                  className="text-xs text-stone-500 hover:text-stone-900 font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {getItemsForDate(selectedDayEvents).length === 0 ? (
                <p className="text-xs text-stone-500 py-4 text-center">No events for this day.</p>
              ) : (
                getItemsForDate(selectedDayEvents).map((it) => (
                  <div
                    key={it.id}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-800">
                        {formatDisplayTime(it.time)}
                      </span>
                      <span className="font-bold text-stone-900 text-xs sm:text-sm">{it.text}</span>
                      {it.location && <span className="text-xs text-stone-600 font-medium">📍 {it.location}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteScheduleItem(it.id)}
                      className="text-stone-400 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Schedule Event Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-stone-300 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="text-base font-serif-heading font-bold text-stone-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-stone-800" />
                Schedule Planner Event
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-800 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModalEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-800 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={modalText}
                  onChange={(e) => setModalText(e.target.value)}
                  placeholder={
                    familyKidsMode
                      ? "e.g. Activity, Call, Appointment"
                      : "e.g. Client Call, Strategy Session, Review"
                  }
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-bold text-stone-900"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Date</label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Time</label>
                  <input
                    type="time"
                    value={modalTime}
                    onChange={(e) => setModalTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Context</label>
                  <select
                    value={modalMode}
                    onChange={(e) => setModalMode(e.target.value as ContextMode)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-bold"
                  >
                    {familyKidsMode && <option value="family">Family</option>}
                    <option value="business">Business</option>
                    <option value="marketing">Marketing</option>
                    <option value="self">Self Care</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Assignee</label>
                  <div className="relative">
                    <input
                      type="text"
                      list="assignee-modal-options"
                      value={modalAssignee}
                      onChange={(e) => setModalAssignee(e.target.value)}
                      placeholder="Type custom name..."
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                    />
                    <datalist id="assignee-modal-options">
                      {assigneeOptions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Recurrence</label>
                  <select
                    value={modalRecurrence}
                    onChange={(e) => setModalRecurrence(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium"
                  >
                    {RECURRENCE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">Location & Directions</label>
                <input
                  type="text"
                  value={modalLocation}
                  onChange={(e) => setModalLocation(e.target.value)}
                  placeholder="e.g. Desk, Studio, or Online"
                  className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Preparation / Action Items
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPrepInput}
                    onChange={(e) => setNewPrepInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newPrepInput.trim()) {
                          setModalPrepList((prev) => [...prev, newPrepInput.trim()]);
                          setNewPrepInput('');
                        }
                      }
                    }}
                    placeholder="e.g. Checklist item..."
                    className="flex-1 px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPrepInput.trim()) {
                        setModalPrepList((prev) => [...prev, newPrepInput.trim()]);
                        setNewPrepInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-lg font-bold text-stone-800 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                {modalPrepList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {modalPrepList.map((p, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-stone-100 rounded text-stone-800 font-medium border border-stone-300"
                      >
                        <span>{p}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setModalPrepList((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-stone-400 hover:text-stone-800 font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!modalText.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  Save to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};