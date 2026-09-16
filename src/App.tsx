import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Sparkles,
  Target,
  Receipt,
  Maximize2,
  ChevronRight,
  BookOpen,
  BookUser,
  UtensilsCrossed,
} from 'lucide-react';
import {
  ContextMode,
  CurrencyCode,
  MomOsState,
  ScheduleItem,
  PriorityItem,
  NoteItem,
  ExpenseItem,
  ContactItem,
  RecipeItem,
  ShoppingListItem,
  Assignee,
  PrepItem,
  DelegationStatus,
  PrioritySubTask,
  ReimbursementStatus,
  FullPageView,
  PriorityColumn,
} from './types';
import { MODE_CONFIGS, INITIAL_STATE, getTodayDateString, DEFAULT_KID_TAGS } from './constants';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { QuickAddsCard } from './components/QuickAddsCard';
import { ScheduleCard } from './components/ScheduleCard';
import { PrioritiesCard } from './components/PrioritiesCard';
import { BrainDumpCard }  from './components/BrainDumpCard';
import { ExpenseCard } from './components/ExpenseCard';
import { Modal } from './components/Modal';
import { Toast, ToastMessage } from './components/Toast';
import { SchedulePlannerView } from './components/views/SchedulePlannerView';
import { BrainDumpWorkspaceView } from './components/views/BrainDumpWorkspaceView';
import { PrioritiesBoardView } from './components/views/PrioritiesBoardView';
import { ExpenseLedgerView } from './components/views/ExpenseLedgerView';
import { ContactsDirectoryView } from './components/views/ContactsDirectoryView';
import { RecipeVaultView } from './components/views/RecipeVaultView';
import { WelcomeBanner } from './components/WelcomeBanner';

export default function App() {
  // Active Context Mode
  const [activeMode, setActiveMode] = useState<ContextMode>(() => {
    const saved = localStorage.getItem('mom_activeMode');
    if (saved && (saved === 'family' || saved === 'business' || saved === 'marketing' || saved === 'self')) {
      return saved as ContextMode;
    }
    return 'family';
  });

  // Full Page Navigation State
  const [currentFullView, setCurrentFullView] = useState<FullPageView>('none');
  const savedScrollPosition = useRef<number>(0);

  // Currency
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('mom_currency');
    if (saved && ['ZAR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(saved)) {
      return saved as CurrencyCode;
    }
    return 'USD';
  });

  // Family & Kids Mode Toggle (Enabled by default)
  const [familyKidsMode, setFamilyKidsMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('mom_familyKidsMode');
    if (saved !== null) {
      return saved === 'true';
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('mom_familyKidsMode', String(familyKidsMode));
  }, [familyKidsMode]);

  const handleToggleFamilyKidsMode = (enabled: boolean) => {
    setFamilyKidsMode(enabled);
    if (!enabled && activeMode === 'family') {
      setActiveMode('business');
    }
    showToast(
      enabled
        ? 'Family & Kids Mode enabled'
        : 'Family & Kids Mode hidden for focused solopreneur/business mode',
      'info'
    );
  };

  // Main State
  const [state, setState] = useState<MomOsState>(() => {
    try {
      const saved = localStorage.getItem('mom_os_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          customQuickAdds: {
            family: parsed.customQuickAdds?.family || [],
            business: parsed.customQuickAdds?.business || [],
            marketing: parsed.customQuickAdds?.marketing || [],
            self: parsed.customQuickAdds?.self || [],
          },
          kidTags: Array.isArray(parsed.kidTags) && parsed.kidTags.length > 0 ? parsed.kidTags : DEFAULT_KID_TAGS,
          schedule: Array.isArray(parsed.schedule) ? parsed.schedule : INITIAL_STATE.schedule,
          priorities: Array.isArray(parsed.priorities) ? parsed.priorities : INITIAL_STATE.priorities,
          notes: Array.isArray(parsed.notes) ? parsed.notes : INITIAL_STATE.notes,
          expenses: Array.isArray(parsed.expenses) ? parsed.expenses : INITIAL_STATE.expenses,
          contacts: Array.isArray(parsed.contacts) ? parsed.contacts : INITIAL_STATE.contacts,
          recipes: Array.isArray(parsed.recipes) ? parsed.recipes : INITIAL_STATE.recipes,
          shoppingList: Array.isArray(parsed.shoppingList) ? parsed.shoppingList : INITIAL_STATE.shoppingList,
        };
      }
    } catch (e) {
      console.error('Error restoring saved state:', e);
    }
    return INITIAL_STATE;
  });

  // UI States
  const [showAllModes, setShowAllModes] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isAddQuickModalOpen, setIsAddQuickModalOpen] = useState(false);
  const [customActionText, setCustomActionText] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState<boolean>(() => {
    try {
      return localStorage.getItem('planner_welcome_dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  const handleDismissWelcomeGuide = () => {
    setShowWelcomeGuide(false);
    try {
      localStorage.setItem('planner_welcome_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const handleToggleWelcomeGuide = () => {
    setShowWelcomeGuide((prev) => {
      const next = !prev;
      try {
        if (!next) {
          localStorage.setItem('planner_welcome_dismissed', 'true');
        } else {
          localStorage.removeItem('planner_welcome_dismissed');
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('mom_os_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('mom_activeMode', activeMode);
  }, [activeMode]);

  useEffect(() => {
    localStorage.setItem('mom_currency', currency);
  }, [currency]);

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3200);
  };

  // Full-Page View Navigation Handlers
  const handleOpenFullView = (view: FullPageView) => {
    savedScrollPosition.current = window.scrollY || window.pageYOffset || 0;
    setCurrentFullView(view);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackToDashboard = () => {
    setCurrentFullView('none');
    setTimeout(() => {
      window.scrollTo({ top: savedScrollPosition.current, behavior: 'instant' });
    }, 20);
  };

  const handleSwitchFullView = (view: FullPageView) => {
    if (view === 'none') {
      handleBackToDashboard();
    } else {
      setCurrentFullView(view);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  // Schedule Actions
  const handleAddQuickScheduleItem = (title: string) => {
    const cleanTitle = title.replace(/^\+\s*/, '');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(Math.ceil(now.getMinutes() / 15) * 15 % 60).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const newItem: ScheduleItem = {
      id: Date.now(),
      text: cleanTitle,
      date: getTodayDateString(),
      time: timeStr,
      mode: activeMode,
      completed: false,
      assignee: 'Mom',
    };

    setState((prev) => ({
      ...prev,
      schedule: [...prev.schedule, newItem],
    }));

    showToast(`Added "${cleanTitle}" at ${timeStr}`);
  };

  const handleAddCustomScheduleItem = (
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
  ) => {
    const newItem: ScheduleItem = {
      id: Date.now(),
      text,
      date: date || getTodayDateString(),
      time: time || '09:00',
      mode,
      completed: false,
      location: extra?.location,
      assignee: extra?.assignee || 'Mom',
      prepList: extra?.prepList,
      recurrence: extra?.recurrence,
    };

    setState((prev) => ({
      ...prev,
      schedule: [...prev.schedule, newItem],
    }));

    showToast(`Scheduled "${text}"`);
  };

  const handleToggleComplete = (id: number) => {
    setState((prev) => ({
      ...prev,
      schedule: prev.schedule.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  const handleDeleteScheduleItem = (id: number) => {
    setState((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((item) => item.id !== id),
    }));
  };

  const handleUpdateScheduleItem = (updated: ScheduleItem) => {
    setState((prev) => ({
      ...prev,
      schedule: prev.schedule.map((item) => (item.id === updated.id ? updated : item)),
    }));
  };

  // Custom Quick Adds
  const handleSaveCustomQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customActionText.trim()) return;

    const formatted = customActionText.trim().startsWith('+')
      ? customActionText.trim()
      : `+ ${customActionText.trim()}`;

    setState((prev) => ({
      ...prev,
      customQuickAdds: {
        ...prev.customQuickAdds,
        [activeMode]: [...(prev.customQuickAdds[activeMode] || []), formatted],
      },
    }));

    setCustomActionText('');
    setIsAddQuickModalOpen(false);
    showToast(`Added quick action for ${MODE_CONFIGS[activeMode].shortTitle}`);
  };

  const handleDeleteCustomQuickAdd = (index: number) => {
    setState((prev) => {
      const currentList = [...(prev.customQuickAdds[activeMode] || [])];
      currentList.splice(index, 1);
      return {
        ...prev,
        customQuickAdds: {
          ...prev.customQuickAdds,
          [activeMode]: currentList,
        },
      };
    });
  };

  // Priority Actions
  const handleAddPriority = (
    text: string,
    mode?: ContextMode,
    extra?: {
      duration?: string;
      delegation?: DelegationStatus;
      subTasks?: PrioritySubTask[];
      recurrence?: PriorityItem['recurrence'];
    }
  ) => {
    const newPriority: PriorityItem = {
      id: Date.now(),
      text,
      done: false,
      mode: mode || activeMode,
      duration: extra?.duration || '15 mins',
      delegation: extra?.delegation || 'myself',
      subTasks: extra?.subTasks,
      recurrence: extra?.recurrence,
    };

    setState((prev) => ({
      ...prev,
      priorities: [...prev.priorities, newPriority],
    }));
    showToast('Priority recorded');
  };

  const handleTogglePriority = (id: number) => {
    setState((prev) => ({
      ...prev,
      priorities: prev.priorities.map((p) => (p.id === id ? { ...p, done: !p.done } : p)),
    }));
  };

  const handleDeletePriority = (id: number) => {
    setState((prev) => ({
      ...prev,
      priorities: prev.priorities.filter((p) => p.id !== id),
    }));
  };

  const handleUpdatePriority = (updated: PriorityItem) => {
    setState((prev) => ({
      ...prev,
      priorities: prev.priorities.map((p) => (p.id === updated.id ? updated : p)),
    }));
  };

  const handleClearCompletedPriorities = () => {
    setState((prev) => ({
      ...prev,
      priorities: prev.priorities.filter((p) => !p.done),
    }));
    showToast('Cleared finished priorities');
  };

  // Note Actions
  const handleAddNote = (
    text: string,
    mode?: ContextMode,
    extra?: {
      kidTag?: string;
      imageUrl?: string;
      imageName?: string;
      hasAudioMemo?: boolean;
      audioDuration?: string;
    }
  ) => {
    const timeString = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(new Date());

    const targetMode = mode || activeMode;

    const newNote: NoteItem = {
      id: Date.now(),
      text,
      mode: targetMode,
      createdAt: `Today, ${timeString}`,
      pinned: false,
      kidTag: extra?.kidTag,
      imageUrl: extra?.imageUrl,
      imageName: extra?.imageName,
      hasAudioMemo: extra?.hasAudioMemo,
      audioDuration: extra?.audioDuration,
    };

    setState((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));
    showToast('Note captured in brain dump');
  };

  const handleDeleteNote = (id: number) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
  };

  const handleTogglePinNote = (id: number) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    }));
  };

  const handleUpdateNote = (updated: NoteItem) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === updated.id ? updated : n)),
    }));
  };

  const handleAddKidTag = (newTag: string) => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    setState((prev) => {
      const current = prev.kidTags || DEFAULT_KID_TAGS;
      if (current.includes(trimmed)) return prev;
      return {
        ...prev,
        kidTags: [...current, trimmed],
      };
    });
    showToast(`Added child tag "${trimmed}"`);
  };

  // Expense Actions
  const handleAddExpense = (
    text: string,
    amount: number,
    mode: ContextMode,
    extra?: {
      subCategory?: string;
      kidTag?: string;
      receiptImage?: string;
      reimbursementStatus?: ReimbursementStatus;
    }
  ) => {
    const newExpense: ExpenseItem = {
      id: Date.now(),
      text,
      amount,
      currency,
      mode,
      date: getTodayDateString(),
      subCategory: extra?.subCategory,
      kidTag: extra?.kidTag,
      receiptImage: extra?.receiptImage,
      reimbursementStatus: extra?.reimbursementStatus || 'none',
    };

    setState((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }));
    showToast(`Logged receipt: ${currency} ${amount.toFixed(2)}`);
  };

  const handleDeleteExpense = (id: number) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  const handleUpdateExpense = (updated: ExpenseItem) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === updated.id ? updated : e)),
    }));
  };

  // Contact Actions
  const handleAddContact = (contactData: Omit<ContactItem, 'id'>) => {
    const newContact: ContactItem = {
      ...contactData,
      id: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      contacts: [...(prev.contacts || []), newContact],
    }));
    showToast(`Saved contact "${newContact.name}"`);
  };

  const handleUpdateContact = (updated: ContactItem) => {
    setState((prev) => ({
      ...prev,
      contacts: (prev.contacts || []).map((c) => (c.id === updated.id ? updated : c)),
    }));
    showToast(`Updated "${updated.name}"`);
  };

  const handleDeleteContact = (id: number) => {
    setState((prev) => ({
      ...prev,
      contacts: (prev.contacts || []).filter((c) => c.id !== id),
    }));
    showToast('Contact removed');
  };

  // Recipe Actions
  const handleAddRecipe = (recipeData: Omit<RecipeItem, 'id'>) => {
    const newRecipe: RecipeItem = {
      ...recipeData,
      id: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      recipes: [...(prev.recipes || []), newRecipe],
    }));
    showToast(`Saved recipe "${newRecipe.title}"`);
  };

  const handleUpdateRecipe = (updated: RecipeItem) => {
    setState((prev) => ({
      ...prev,
      recipes: (prev.recipes || []).map((r) => (r.id === updated.id ? updated : r)),
    }));
    showToast(`Updated "${updated.title}"`);
  };

  const handleDeleteRecipe = (id: number) => {
    setState((prev) => ({
      ...prev,
      recipes: (prev.recipes || []).filter((r) => r.id !== id),
    }));
    showToast('Recipe deleted');
  };

  // Shopping List Actions
  const handleAddShoppingItem = (item: Omit<ShoppingListItem, 'id'>) => {
    const newItem: ShoppingListItem = {
      ...item,
      id: `shop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setState((prev) => ({
      ...prev,
      shoppingList: [...(prev.shoppingList || []), newItem],
    }));
    showToast(`Added ${item.name} to shopping list`);
  };

  const handleAddMultipleShoppingItems = (items: Omit<ShoppingListItem, 'id'>[]) => {
    const newItems: ShoppingListItem[] = items.map((item, idx) => ({
      ...item,
      id: `shop-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
    }));
    setState((prev) => ({
      ...prev,
      shoppingList: [...(prev.shoppingList || []), ...newItems],
    }));
    showToast(`Added ${items.length} ingredients to shopping list`);
  };

  const handleToggleShoppingItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      shoppingList: (prev.shoppingList || []).map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const handleDeleteShoppingItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      shoppingList: (prev.shoppingList || []).filter((item) => item.id !== id),
    }));
  };

  const handleClearCheckedShoppingItems = () => {
    setState((prev) => ({
      ...prev,
      shoppingList: (prev.shoppingList || []).filter((item) => !item.checked),
    }));
    showToast('Cleared checked items');
  };

  const handleClearAllShoppingItems = () => {
    setState((prev) => ({
      ...prev,
      shoppingList: [],
    }));
    showToast('Shopping list cleared');
  };

  // Backup / Export
  const handleExport = () => {
    try {
      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `mompreneur_life_os_backup_${getTodayDateString()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Backup JSON downloaded successfully');
    } catch (e) {
      showToast('Failed to export backup', 'error');
    }
  };

  // Restore / Import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = JSON.parse(content);
        if (typeof imported === 'object' && imported !== null) {
          setState({
            customQuickAdds: {
              family: imported.customQuickAdds?.family || [],
              business: imported.customQuickAdds?.business || [],
              marketing: imported.customQuickAdds?.marketing || [],
              self: imported.customQuickAdds?.self || [],
            },
            kidTags: Array.isArray(imported.kidTags) && imported.kidTags.length > 0 ? imported.kidTags : DEFAULT_KID_TAGS,
            schedule: Array.isArray(imported.schedule) ? imported.schedule : [],
            priorities: Array.isArray(imported.priorities) ? imported.priorities : [],
            notes: Array.isArray(imported.notes) ? imported.notes : [],
            expenses: Array.isArray(imported.expenses) ? imported.expenses : [],
            contacts: Array.isArray(imported.contacts) ? imported.contacts : [],
            recipes: Array.isArray(imported.recipes) ? imported.recipes : [],
            shoppingList: Array.isArray(imported.shoppingList) ? imported.shoppingList : [],
          });
          showToast('Data restored successfully!');
        } else {
          showToast('Invalid backup file format', 'error');
        }
      } catch (err) {
        showToast('Error reading backup file', 'error');
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleConfirmReset = () => {
    localStorage.removeItem('mom_os_state');
    setState(INITIAL_STATE);
    setIsResetModalOpen(false);
    showToast('Reset to default starter template');
  };

  const handlePrint = () => {
    window.print();
  };

  const itemCountsByMode: Record<ContextMode, number> = {
    family: state.schedule.filter((i) => i.mode === 'family').length,
    business: state.schedule.filter((i) => i.mode === 'business').length,
    marketing: state.schedule.filter((i) => i.mode === 'marketing').length,
    self: state.schedule.filter((i) => i.mode === 'self').length,
  };

  return (
    <div className="min-h-screen bg-[#faf7f5] text-stone-800 pb-16">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportFile}
      />

      <AnimatePresence mode="wait">
        {currentFullView === 'schedule' && (
          <motion.div
            key="schedule-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <SchedulePlannerView
              schedule={state.schedule}
              activeMode={activeMode}
              familyKidsMode={familyKidsMode}
              onAddScheduleItem={handleAddCustomScheduleItem}
              onToggleComplete={handleToggleComplete}
              onDeleteScheduleItem={handleDeleteScheduleItem}
              onUpdateScheduleItem={handleUpdateScheduleItem}
              onBackToDashboard={handleBackToDashboard}
              onSwitchView={handleSwitchFullView}
            />
          </motion.div>
        )}

        {currentFullView === 'braindump' && (
          <motion.div
            key="braindump-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <BrainDumpWorkspaceView
              notes={state.notes}
              activeMode={activeMode}
              kidTags={state.kidTags || DEFAULT_KID_TAGS}
              familyKidsMode={familyKidsMode}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onTogglePin={handleTogglePinNote}
              onUpdateNote={handleUpdateNote}
              onAddKidTag={handleAddKidTag}
              onBackToDashboard={handleBackToDashboard}
              onSwitchView={handleSwitchFullView}
            />
          </motion.div>
        )}

        {currentFullView === 'priorities' && (
          <motion.div
            key="priorities-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <PrioritiesBoardView
              priorities={state.priorities}
              activeMode={activeMode}
              familyKidsMode={familyKidsMode}
              onAddPriority={handleAddPriority}
              onToggleDone={handleTogglePriority}
              onDeletePriority={handleDeletePriority}
              onUpdatePriority={handleUpdatePriority}
              onBackToDashboard={handleBackToDashboard}
              onSwitchView={handleSwitchFullView}
            />
          </motion.div>
        )}

        {currentFullView === 'expenses' && (
          <motion.div
            key="expenses-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ExpenseLedgerView
              expenses={state.expenses}
              activeMode={activeMode}
              currency={currency}
              kidTags={state.kidTags || DEFAULT_KID_TAGS}
              familyKidsMode={familyKidsMode}
              onAddExpense={(text, amount, mode, extra) => handleAddExpense(text, amount, mode || activeMode, extra)}
              onDeleteExpense={handleDeleteExpense}
              onUpdateExpense={handleUpdateExpense}
              onBackToDashboard={handleBackToDashboard}
              onSwitchView={handleSwitchFullView}
            />
          </motion.div>
        )}

        {currentFullView === 'contacts' && (
          <motion.div
            key="contacts-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ContactsDirectoryView
              contacts={state.contacts || []}
              activeMode={activeMode}
              kidTags={state.kidTags || DEFAULT_KID_TAGS}
              familyKidsMode={familyKidsMode}
              onAddContact={handleAddContact}
              onUpdateContact={handleUpdateContact}
              onDeleteContact={handleDeleteContact}
              onBackToDashboard={handleBackToDashboard}
              onSwitchView={handleSwitchFullView}
            />
          </motion.div>
        )}

        {currentFullView === 'recipes' && (
          <motion.div
            key="recipes-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <RecipeVaultView
              recipes={state.recipes || []}
              shoppingList={state.shoppingList || []}
              activeMode={activeMode}
              familyKidsMode={familyKidsMode}
              onAddRecipe={handleAddRecipe}
              onUpdateRecipe={handleUpdateRecipe}
              onDeleteRecipe={handleDeleteRecipe}
              onAddShoppingItem={handleAddShoppingItem}
              onAddMultipleShoppingItems={handleAddMultipleShoppingItems}
              onToggleShoppingItem={handleToggleShoppingItem}
              onDeleteShoppingItem={handleDeleteShoppingItem}
              onClearCheckedShoppingItems={handleClearCheckedShoppingItems}
              onClearAllShoppingItems={handleClearAllShoppingItems}
              onBackToDashboard={handleBackToDashboard}
              onSwitchView={handleSwitchFullView}
            />
          </motion.div>
        )}

        {currentFullView === 'none' && (
          <motion.main
            key="dashboard-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6"
          >
            <Header
              currentDateStr={getTodayDateString()}
              currency={currency}
              onCurrencyChange={setCurrency}
              onExport={handleExport}
              onImportClick={() => fileInputRef.current?.click()}
              onResetClick={() => setIsResetModalOpen(true)}
              onPrint={handlePrint}
              activeModeLabel={MODE_CONFIGS[activeMode].shortTitle}
              familyKidsMode={familyKidsMode}
              onToggleFamilyKidsMode={handleToggleFamilyKidsMode}
              showGuide={showWelcomeGuide}
              onToggleGuide={handleToggleWelcomeGuide}
            />

            <ModeSelector
              activeMode={activeMode}
              onSelectMode={setActiveMode}
              showAllModes={showAllModes}
              onToggleShowAllModes={setShowAllModes}
              itemCountsByMode={itemCountsByMode}
              familyKidsMode={familyKidsMode}
            />

            <WelcomeBanner
              isOpen={showWelcomeGuide}
              onClose={handleDismissWelcomeGuide}
              familyKidsMode={familyKidsMode}
              onToggleFamilyKidsMode={handleToggleFamilyKidsMode}
              onOpenWorkspace={handleOpenFullView}
            />

            <div className="no-print my-4 bg-white/90 border border-stone-200/90 rounded-2xl p-3 shadow-2xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">APP WORKSPACES</h3>
                    <p className="text-[11px] text-stone-500">
                      Expand any module into a full focused workspace
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:flex xl:items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleOpenFullView('schedule')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-950 bg-rose-50 hover:bg-rose-100/90 border border-rose-200/80 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <Calendar className="w-3.5 h-3.5 text-rose-700" />
                    <span>Schedule & Day/Week</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenFullView('braindump')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-950 bg-indigo-50 hover:bg-indigo-100/90 border border-indigo-200/80 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                    <span>Notes Workspace</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenFullView('priorities')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-50 hover:bg-amber-100/90 border border-amber-200/80 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <Target className="w-3.5 h-3.5 text-amber-700" />
                    <span>Action Board</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenFullView('expenses')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/80 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Expense Ledger</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenFullView('contacts')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-950 bg-blue-50 hover:bg-blue-100/90 border border-blue-200/80 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <BookUser className="w-3.5 h-3.5 text-blue-700" />
                    <span>Emergency & Key Contacts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenFullView('recipes')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-orange-50 hover:bg-orange-100/90 border border-orange-200/80 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5 text-orange-700" />
                    <span>{familyKidsMode ? 'Meal Prep & Recipes' : 'Personal Meal Prep'}</span>
                  </button>
                </div>
              </div>
            </div>

            <QuickAddsCard
              activeMode={activeMode}
              customQuickAdds={state.customQuickAdds[activeMode] || []}
              onAddScheduleItem={handleAddQuickScheduleItem}
              onOpenAddModal={() => setIsAddQuickModalOpen(true)}
              onDeleteCustomQuickAdd={handleDeleteCustomQuickAdd}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-6">
                <ScheduleCard
                  activeMode={activeMode}
                  schedule={state.schedule}
                  showAllModes={showAllModes}
                  onAddScheduleItem={handleAddCustomScheduleItem}
                  onToggleComplete={handleToggleComplete}
                  onDeleteScheduleItem={handleDeleteScheduleItem}
                  onUpdateScheduleItem={handleUpdateScheduleItem}
                  onOpenFullView={() => handleOpenFullView('schedule')}
                />

                <BrainDumpCard
                  notes={state.notes}
                  activeMode={activeMode}
                  kidTags={state.kidTags || DEFAULT_KID_TAGS}
                  familyKidsMode={familyKidsMode}
                  onAddNote={handleAddNote}
                  onDeleteNote={handleDeleteNote}
                  onTogglePin={handleTogglePinNote}
                  onUpdateNote={handleUpdateNote}
                  onAddKidTag={handleAddKidTag}
                />
              </div>

              <div className="lg:col-span-5 space-y-6">
                <PrioritiesCard
                  priorities={state.priorities}
                  activeMode={activeMode}
                  familyKidsMode={familyKidsMode}
                  onAddPriority={handleAddPriority}
                  onTogglePriority={handleTogglePriority}
                  onDeletePriority={handleDeletePriority}
                  onClearCompleted={handleClearCompletedPriorities}
                  onUpdatePriority={handleUpdatePriority}
                  onOpenFullView={() => handleOpenFullView('priorities')}
                />

                <ExpenseCard
                  expenses={state.expenses}
                  currency={currency}
                  activeMode={activeMode}
                  kidTags={state.kidTags || DEFAULT_KID_TAGS}
                  familyKidsMode={familyKidsMode}
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                  onUpdateExpense={handleUpdateExpense}
                  onOpenFullView={() => handleOpenFullView('expenses')}
                />
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Application Template?"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            This will reset your schedule, notes, priorities, expenses, contacts, and recipes back to the default
            starter template. If you want to keep your current entries, make sure to click{' '}
            <strong className="text-stone-900 font-semibold">Backup</strong> first.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReset}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
            >
              Confirm Reset
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddQuickModalOpen}
        onClose={() => setIsAddQuickModalOpen(false)}
        title={`New Quick Action for ${MODE_CONFIGS[activeMode].shortTitle}`}
      >
        <form onSubmit={handleSaveCustomQuickAdd} className="space-y-4">
          <div>
            <label
              htmlFor="customActionInput"
              className="block text-xs font-semibold text-stone-700 mb-1.5"
            >
              Quick Action Name
            </label>
            <input
              id="customActionInput"
              type="text"
              autoFocus
              value={customActionText}
              onChange={(e) => setCustomActionText(e.target.value)}
              placeholder="e.g., Client Podcast Recording, Grocery Run..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 placeholder:text-stone-400 transition-all"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              This chip will appear in your {MODE_CONFIGS[activeMode].shortTitle} quick-adds for
              instant 1-click scheduling.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsAddQuickModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!customActionText.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
            >
              Save Action
            </button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}