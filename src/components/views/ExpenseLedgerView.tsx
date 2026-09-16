import React, { useState, useRef, useMemo } from 'react';
import {
  Receipt,
  Plus,
  TrendingUp,
  PieChart as PieChartIcon,
  Tag,
  Camera,
  Image as ImageIcon,
  DollarSign,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Eye,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ExpenseItem,
  ContextMode,
  CurrencyCode,
  ReimbursementStatus,
  FullPageView,
} from '../../types';
import { formatCurrencyAmount } from '../../utils/calendar';
import {
  EXPENSE_SUBCATEGORIES,
  SOLOPRENEUR_EXPENSE_SUBCATEGORIES,
  DEFAULT_KID_TAGS,
  MODE_CONFIGS,
} from '../../constants';
import { ModuleNavHeader } from './ModuleNavHeader';

const STATUS_CONFIG: Record<
  ReimbursementStatus,
  { label: string; color: string; next: ReimbursementStatus }
> = {
  none: {
    label: 'Personal',
    color: 'bg-stone-100 text-stone-700 border-stone-200',
    next: 'pending_split',
  },
  pending_split: {
    label: '⏳ Split Pending',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    next: 'reimbursed',
  },
  reimbursed: {
    label: '✅ Reimbursed',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    next: 'claimable',
  },
  claimable: {
    label: '💼 Tax Write-off',
    color: 'bg-blue-50 text-blue-800 border-blue-200',
    next: 'none',
  },
};

interface ExpenseLedgerViewProps {
  expenses: ExpenseItem[];
  activeMode: ContextMode;
  currency: CurrencyCode;
  kidTags?: string[];
  familyKidsMode?: boolean;
  onAddExpense: (
    text: string,
    amount: number,
    mode?: ContextMode,
    extra?: {
      subCategory?: string;
      kidTag?: string;
      receiptImage?: string;
      reimbursementStatus?: ReimbursementStatus;
    }
  ) => void;
  onDeleteExpense: (id: number) => void;
  onUpdateExpense?: (updated: ExpenseItem) => void;
  onBackToDashboard: () => void;
  onSwitchView: (view: FullPageView) => void;
}

export const ExpenseLedgerView: React.FC<ExpenseLedgerViewProps> = ({
  expenses,
  activeMode,
  currency,
  kidTags = DEFAULT_KID_TAGS,
  familyKidsMode = true,
  onAddExpense,
  onDeleteExpense,
  onUpdateExpense,
  onBackToDashboard,
  onSwitchView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCatFilter, setSelectedSubCatFilter] = useState('all');
  const [selectedKidFilter, setSelectedKidFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedModeFilter, setSelectedModeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'ledger' | 'gallery' | 'analytics'>('ledger');

  // Modal / Creator State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newMode, setNewMode] = useState<ContextMode>(activeMode === 'family' && !familyKidsMode ? 'business' : activeMode);
  const [newSubCat, setNewSubCat] = useState(familyKidsMode ? 'School Supplies' : 'Software & Apps');
  const [newKid, setNewKid] = useState('All Kids');
  const [newStatus, setNewStatus] = useState<ReimbursementStatus>('none');
  const [newReceiptImg, setNewReceiptImg] = useState<string | null>(null);

  // Available Subcategories
  const availableSubCategories = useMemo(() => {
    return familyKidsMode ? EXPENSE_SUBCATEGORIES : SOLOPRENEUR_EXPENSE_SUBCATEGORIES;
  }, [familyKidsMode]);

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Base Solopreneur / Family Filtered Expenses
  const activeExpenses = useMemo(() => {
    return expenses.filter(
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
          !item.text.toLowerCase().includes('kids') &&
          item.subCategory !== 'School Supplies' &&
          item.subCategory !== 'Childcare / Babysitting' &&
          item.subCategory !== 'Extracurriculars')
    );
  }, [expenses, familyKidsMode]);

  // Financial Metrics Calculations
  const metrics = useMemo(() => {
    let total = 0;
    let businessTax = 0;
    let familyKidsOrPersonal = 0;
    let pendingSplit = 0;
    let reimbursedTotal = 0;

    activeExpenses.forEach((e) => {
      total += e.amount;
      if (e.mode === 'business' || e.mode === 'marketing' || e.reimbursementStatus === 'claimable') {
        businessTax += e.amount;
      }
      if (familyKidsMode) {
        if (e.mode === 'family' || e.kidTag) {
          familyKidsOrPersonal += e.amount;
        }
      } else {
        if (e.mode === 'self') {
          familyKidsOrPersonal += e.amount;
        }
      }
      if (e.reimbursementStatus === 'pending_split') {
        pendingSplit += e.amount;
      }
      if (e.reimbursementStatus === 'reimbursed') {
        reimbursedTotal += e.amount;
      }
    });

    return { total, businessTax, familyKidsOrPersonal, pendingSplit, reimbursedTotal };
  }, [activeExpenses, familyKidsMode]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return activeExpenses.filter((e) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = e.text.toLowerCase().includes(q);
        const matchesCat = e.subCategory?.toLowerCase().includes(q);
        const matchesKid = e.kidTag?.toLowerCase().includes(q);
        if (!matchesDesc && !matchesCat && !matchesKid) return false;
      }
      if (selectedSubCatFilter !== 'all' && e.subCategory !== selectedSubCatFilter) return false;
      if (selectedKidFilter !== 'all' && e.kidTag !== selectedKidFilter) return false;
      if (selectedStatusFilter !== 'all' && (e.reimbursementStatus || 'none') !== selectedStatusFilter)
        return false;
      if (selectedModeFilter !== 'all' && e.mode !== selectedModeFilter) return false;
      return true;
    });
  }, [
    activeExpenses,
    searchQuery,
    selectedSubCatFilter,
    selectedKidFilter,
    selectedStatusFilter,
    selectedModeFilter,
  ]);

  // Receipts only for gallery
  const receiptItems = useMemo(() => {
    return activeExpenses.filter((e) => Boolean(e.receiptImage));
  }, [activeExpenses]);

  // Category Breakdown for Visual Charts
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      const cat = e.subCategory || (e.mode === 'business' ? 'Business Expense' : 'General');
      map[cat] = (map[cat] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  // Kid-wise Breakdown
  const kidStats = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      const k = e.kidTag || 'General / Shared';
      map[k] = (map[k] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  // Cycle reimbursement
  const handleCycleStatus = (item: ExpenseItem) => {
    if (!onUpdateExpense) return;
    const cycleOrder: ReimbursementStatus[] = [
      'none',
      'pending_split',
      'reimbursed',
      'claimable',
    ];
    const currIdx = cycleOrder.indexOf(item.reimbursementStatus || 'none');
    const nextStatus = cycleOrder[(currIdx + 1) % cycleOrder.length];
    onUpdateExpense({ ...item, reimbursementStatus: nextStatus });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Receipt size exceeds 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      if (res) setNewReceiptImg(res);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(newAmount);
    if (!newDesc.trim() || isNaN(num) || num <= 0) return;

    onAddExpense(newDesc.trim(), num, newMode, {
      subCategory: newSubCat,
      kidTag: newKid !== 'All Kids' ? newKid : undefined,
      receiptImage: newReceiptImg || undefined,
      reimbursementStatus: newStatus,
    });

    setNewDesc('');
    setNewAmount('');
    setNewReceiptImg(null);
    setIsAddModalOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Description', 'Amount', 'Currency', 'Context', 'Category', 'Kid Tag', 'Status'];
    const rows = expenses.map((e) => [
      e.id,
      `"${e.text.replace(/"/g, '""')}"`,
      e.amount,
      currency,
      e.mode || 'family',
      `"${e.subCategory || ''}"`,
      `"${e.kidTag || ''}"`,
      e.reimbursementStatus || 'none',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mompreneur_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#faf7f5] text-stone-800 pb-16">
      {/* Sticky Top Nav Bar */}
      <ModuleNavHeader
        currentView="expenses"
        activeMode={activeMode}
        onBackToDashboard={onBackToDashboard}
        onSwitchView={onSwitchView}
        title="Quick Expense Ledger, Receipts & Analytics"
        badgeText={formatCurrencyAmount(metrics.total, currency)}
        onPrint={() => window.print()}
        printLabel="Print Ledger Sheet"
      />

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2">
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Receipt zoom"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-4">
        {/* Financial Metrics Cards Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
              Total Spending
            </span>
            <div className="text-xl sm:text-2xl font-bold font-serif-heading text-rose-950 mt-0.5">
              {formatCurrencyAmount(metrics.total, currency)}
            </div>
            <span className="text-[10px] text-stone-500">{expenses.length} total logged items</span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tax Deductible
            </span>
            <div className="text-xl sm:text-2xl font-bold font-serif-heading text-emerald-950 mt-0.5">
              {formatCurrencyAmount(metrics.businessTax, currency)}
            </div>
            <span className="text-[10px] text-stone-500">Business & claimable</span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              {familyKidsMode ? 'Family & Kids' : 'Personal & Self'}
            </span>
            <div className="text-xl sm:text-2xl font-bold font-serif-heading text-rose-950 mt-0.5">
              {formatCurrencyAmount(metrics.familyKidsOrPersonal, currency)}
            </div>
            <span className="text-[10px] text-stone-500">
              {familyKidsMode ? 'School, sports & living' : 'Self-care, wellness & lifestyle'}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Split Pending
            </span>
            <div className="text-xl sm:text-2xl font-bold font-serif-heading text-amber-950 mt-0.5">
              {formatCurrencyAmount(metrics.pendingSplit, currency)}
            </div>
            <span className="text-[10px] text-stone-500">Awaiting co-parent reimbursement</span>
          </div>
        </div>

        {/* View Tabs & Action Bar */}
        <div className="bg-white rounded-2xl border border-stone-200 p-3.5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'ledger' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
              }`}
            >
              📑 Comprehensive Ledger
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'gallery' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Receipt Gallery ({receiptItems.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'analytics' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
              }`}
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Visual Charts</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl"
              title="Download CSV report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: COMPREHENSIVE LEDGER TABLE */}
        {/* ========================================================= */}
        {activeTab === 'ledger' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={familyKidsMode ? "Search vendor, description, or child..." : "Search vendor or description..."}
                className="w-full sm:w-64 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none"
              />

              <div className="flex items-center gap-1.5 flex-wrap text-xs w-full sm:w-auto">
                <select
                  aria-label="Filter subcategory"
                  value={selectedSubCatFilter}
                  onChange={(e) => setSelectedSubCatFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-700"
                >
                  <option value="all">All Categories</option>
                  {availableSubCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {familyKidsMode && (
                  <select
                    aria-label="Filter child tag"
                    value={selectedKidFilter}
                    onChange={(e) => setSelectedKidFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-700"
                  >
                    <option value="all">👶 All Kids</option>
                    {kidTags.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  aria-label="Filter status"
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-700"
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    {familyKidsMode && <th className="py-2.5 px-3">Child / Assignee</th>}
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Receipt</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={familyKidsMode ? 7 : 6} className="py-8 text-center text-stone-400">
                        No expenses match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((e) => {
                      const statusInfo =
                        STATUS_CONFIG[e.reimbursementStatus || 'none'] ||
                        STATUS_CONFIG['none'];

                      return (
                        <tr key={e.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-stone-800">
                            {e.text}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-600 font-medium">
                              {e.subCategory || (e.mode === 'business' ? 'Business' : 'General')}
                            </span>
                          </td>
                          {familyKidsMode && (
                            <td className="py-2.5 px-3">
                              {e.kidTag ? (
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-full font-semibold">
                                  🧒 {e.kidTag}
                                </span>
                              ) : (
                                <span className="text-stone-400">—</span>
                              )}
                            </td>
                          )}
                          <td className="py-2.5 px-3">
                            <button
                              type="button"
                              onClick={() => handleCycleStatus(e)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${statusInfo.color}`}
                              title="Click to cycle status"
                            >
                              {statusInfo.label}
                            </button>
                          </td>
                          <td className="py-2.5 px-3">
                            {e.receiptImage ? (
                              <button
                                type="button"
                                onClick={() => setLightboxImage(e.receiptImage!)}
                                className="inline-flex items-center gap-1 text-rose-800 hover:underline font-semibold"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                            ) : (
                              <span className="text-stone-300">None</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold font-mono text-stone-900">
                            {formatCurrencyAmount(e.amount, currency)}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => onDeleteExpense(e.id)}
                              className="text-stone-300 hover:text-rose-700 p-1"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: RECEIPT PHOTO GALLERY */}
        {/* ========================================================= */}
        {activeTab === 'gallery' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-serif-heading font-bold text-stone-800">
                Receipts & Tax Write-off Gallery ({receiptItems.length})
              </h3>
              <span className="text-xs text-stone-500">
                Click any receipt to zoom in for totals and items
              </span>
            </div>

            {receiptItems.length === 0 ? (
              <div className="p-12 text-center text-stone-400 space-y-2 border border-dashed border-stone-200 rounded-xl">
                <Camera className="w-8 h-8 mx-auto text-stone-300" />
                <p className="text-xs font-semibold">No receipt photos attached yet.</p>
                <p className="text-[11px]">
                  When adding an expense, snap or upload a receipt to store tax records here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {receiptItems.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => setLightboxImage(e.receiptImage!)}
                    className="group bg-stone-50 rounded-xl border border-stone-200 overflow-hidden hover:border-rose-300 cursor-pointer shadow-2xs transition-all flex flex-col"
                  >
                    <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                      <img
                        src={e.receiptImage}
                        alt={e.text}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity gap-1">
                        <Eye className="w-4 h-4" /> Zoom
                      </div>
                    </div>

                    <div className="p-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-800 text-xs truncate max-w-[120px]">
                          {e.text}
                        </span>
                        <span className="font-mono font-bold text-rose-950 text-xs">
                          {formatCurrencyAmount(e.amount, currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-stone-500">
                        <span>{e.subCategory || 'General'}</span>
                        {familyKidsMode && e.kidTag && <span className="font-semibold text-rose-700">{e.kidTag}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: VISUAL SPENDING CHARTS */}
        {/* ========================================================= */}
        {activeTab === 'analytics' && (
          <div className={`grid grid-cols-1 ${familyKidsMode ? 'md:grid-cols-2' : 'max-w-xl mx-auto'} gap-5`}>
            {/* Category Breakdown Chart */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
              <h3 className="font-serif-heading font-bold text-sm text-stone-800 flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-rose-800" />
                Category Spending Allocation
              </h3>

              <div className="space-y-2.5 pt-2">
                {categoryStats.map(([cat, amt]) => {
                  const percent = metrics.total > 0 ? (amt / metrics.total) * 100 : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-stone-700">{cat}</span>
                        <span className="font-mono text-stone-900">
                          {formatCurrencyAmount(amt, currency)} ({percent.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-800 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(4, percent))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Child-Wise Breakdown Chart (Only when Family & Kids Mode is enabled) */}
            {familyKidsMode && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
                <h3 className="font-serif-heading font-bold text-sm text-stone-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-800" />
                  Child & Family Spending Breakdown
                </h3>

                <div className="space-y-2.5 pt-2">
                  {kidStats.map(([kid, amt]) => {
                    const percent = metrics.total > 0 ? (amt / metrics.total) * 100 : 0;
                    return (
                      <div key={kid} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-stone-700 flex items-center gap-1">
                            🧒 {kid}
                          </span>
                          <span className="font-mono text-stone-900">
                            {formatCurrencyAmount(amt, currency)} ({percent.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-700 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(4, percent))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-stone-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-base font-serif-heading font-bold text-stone-800 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-800" />
                Log New Expense
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Item / Vendor *</label>
                <input
                  type="text"
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Leo's Soccer Cleats, Canva Pro Subscription, Groceries"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-semibold"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={newSubCat}
                    onChange={(e) => setNewSubCat(e.target.value)}
                    className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-semibold"
                  >
                    {availableSubCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`grid grid-cols-1 ${familyKidsMode ? 'sm:grid-cols-2' : ''} gap-2.5`}>
                {familyKidsMode && (
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Child Tag</label>
                    <select
                      value={newKid}
                      onChange={(e) => setNewKid(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
                    >
                      <option value="All Kids">All Kids / Shared</option>
                      {kidTags.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Reimbursement</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ReimbursementStatus)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
                  >
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Receipt photo */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Attach Receipt</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 font-semibold flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{newReceiptImg ? 'Change Photo' : 'Upload Receipt Photo'}</span>
                  </button>
                  {newReceiptImg && (
                    <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newDesc.trim() || !newAmount}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 rounded-xl shadow-xs disabled:opacity-50"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
