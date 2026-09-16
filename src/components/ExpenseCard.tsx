import React, { useState, useRef, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Tag,
  TrendingDown,
  Layers,
  Camera,
  Eye,
  X,
  Split,
  CheckCircle,
  Clock,
  Sparkles,
  DollarSign,
  Maximize2,
} from 'lucide-react';
import {
  ContextMode,
  CurrencyCode,
  ExpenseItem,
  ReimbursementStatus,
} from '../types';
import { formatCurrencyAmount } from '../utils/calendar';
import { MODE_CONFIGS, EXPENSE_SUB_CATEGORIES, DEFAULT_KID_TAGS } from '../constants';

interface ExpenseCardProps {
  expenses: ExpenseItem[];
  currency: CurrencyCode;
  activeMode: ContextMode;
  kidTags?: string[];
  familyKidsMode?: boolean;
  onAddExpense: (
    text: string,
    amount: number,
    mode: ContextMode,
    extra?: {
      subCategory?: string;
      kidTag?: string;
      receiptImage?: string;
      reimbursementStatus?: ReimbursementStatus;
    }
  ) => void;
  onDeleteExpense: (id: number) => void;
  onUpdateExpense?: (updated: ExpenseItem) => void;
  onOpenFullView?: () => void;
}

const REIMBURSE_CONFIG: Record<
  ReimbursementStatus,
  { label: string; bg: string; text: string; border: string; next: ReimbursementStatus }
> = {
  none: {
    label: 'Personal',
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    border: 'border-stone-200',
    next: 'pending_split',
  },
  pending_split: {
    label: '⏳ Split Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    next: 'reimbursed',
  },
  reimbursed: {
    label: '✅ Reimbursed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    next: 'claimable',
  },
  claimable: {
    label: '🏷️ Tax Claimable',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    next: 'none',
  },
};

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expenses,
  currency,
  activeMode,
  kidTags = DEFAULT_KID_TAGS,
  familyKidsMode = true,
  onAddExpense,
  onDeleteExpense,
  onUpdateExpense,
  onOpenFullView,
}) => {
  const [desc, setDesc] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [expenseMode, setExpenseMode] = useState<ContextMode>(activeMode);
  const [subCategory, setSubCategory] = useState<string>('School Supplies');
  const [selectedKidTag, setSelectedKidTag] = useState<string>('none');
  const [reimburseStatus, setReimburseStatus] = useState<ReimbursementStatus>('none');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Detailed fields toggle
  const [showAddDetails, setShowAddDetails] = useState(false);
  const [isDetailedView, setIsDetailedView] = useState(true);

  // Lightbox for receipt viewing
  const [lightboxReceipt, setLightboxReceipt] = useState<{ url: string; title: string } | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Receipt photo is too large. Please select an image under 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        setReceiptImage(result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr);
    if (!desc.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddExpense(desc.trim(), parsedAmount, expenseMode, {
      subCategory: showAddDetails || expenseMode === 'family' ? subCategory : undefined,
      kidTag: selectedKidTag !== 'none' ? selectedKidTag : undefined,
      receiptImage: receiptImage || undefined,
      reimbursementStatus: reimburseStatus,
    });

    setDesc('');
    setAmountStr('');
    setReceiptImage(null);
    setShowAddDetails(false);
    setReimburseStatus('none');
  };

  const handleCycleReimbursement = (item: ExpenseItem) => {
    if (!onUpdateExpense) return;
    const current = item.reimbursementStatus || 'none';
    const next = REIMBURSE_CONFIG[current]?.next || 'none';
    onUpdateExpense({ ...item, reimbursementStatus: next });
  };

  // Solopreneur / Family Filtered Expenses
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
          !item.text.toLowerCase().includes('school') &&
          !item.text.toLowerCase().includes('tuition') &&
          !item.text.toLowerCase().includes('daycare'))
    );
  }, [expenses, familyKidsMode]);

  // Calculations
  const totalAmount = activeExpenses.reduce((sum, item) => sum + item.amount, 0);
  const businessAmount = activeExpenses
    .filter(
      (item) =>
        item.mode === 'business' ||
        item.mode === 'marketing' ||
        item.reimbursementStatus === 'claimable'
    )
    .reduce((sum, item) => sum + item.amount, 0);
  const familyAmount = activeExpenses
    .filter(
      (item) =>
        item.mode === 'family' ||
        item.mode === 'self' ||
        (!item.mode && item.reimbursementStatus !== 'claimable')
    )
    .reduce((sum, item) => sum + item.amount, 0);
  const pendingSplitAmount = activeExpenses
    .filter((item) => item.reimbursementStatus === 'pending_split')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div
      id="card-expenses"
      className="bg-white rounded-2xl border border-stone-200 shadow-xs p-4 sm:p-5 card-print transition-all"
    >
      {/* Lightbox for receipt */}
      {lightboxReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          onClick={() => setLightboxReceipt(null)}
        >
          <div
            className="relative max-w-xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-2 border-b border-stone-100">
              <span className="text-xs font-semibold text-stone-800">
                Receipt: {lightboxReceipt.title}
              </span>
              <button
                type="button"
                onClick={() => setLightboxReceipt(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={lightboxReceipt.url}
              alt="Receipt preview"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Receipt className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2
                onClick={onOpenFullView}
                className={`font-serif-heading text-base font-bold text-stone-800 ${
                  onOpenFullView ? 'hover:text-rose-900 cursor-pointer group flex items-center gap-1.5' : ''
                }`}
                title={onOpenFullView ? 'Open Full Expense Ledger & Analytics' : undefined}
              >
                <span>Quick Expense Log</span>
                {onOpenFullView && (
                  <Maximize2 className="w-3.5 h-3.5 text-stone-400 group-hover:text-rose-800 transition-colors" />
                )}
              </h2>
              {activeMode === 'family' && (
                <span className="text-[10px] font-semibold bg-emerald-100/70 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Family Budget & Splits
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400">
              Receipts, kid categories, split costs & business write-offs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ledger Button */}
          {onOpenFullView && (
            <button
              type="button"
              onClick={onOpenFullView}
              className="no-print inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-lg transition-colors cursor-pointer"
              title="Open full-screen comprehensive expense ledger with visual charts and receipt gallery"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-800" />
              <span className="hidden sm:inline">Ledger</span>
            </button>
          )}

          {/* Detailed View Toggle */}
          <button
            type="button"
            onClick={() => setIsDetailedView((prev) => !prev)}
            className="no-print inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-lg transition-colors"
            title={isDetailedView ? 'Switch to compact view' : 'Expand receipt & split details'}
          >
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">
              {isDetailedView ? 'Detailed' : 'Compact'}
            </span>
          </button>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
            {formatCurrencyAmount(totalAmount, currency)}
          </span>
        </div>
      </div>

      {/* Summary Metric Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-stone-50/80 border border-stone-200/70 rounded-xl mb-4 text-xs">
        <div>
          <span className="text-[10px] uppercase font-semibold text-stone-400">Total Logged</span>
          <p className="font-bold text-stone-800">
            {formatCurrencyAmount(totalAmount, currency)}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-blue-600">Business / Tax</span>
          <p className="font-bold text-blue-900">
            {formatCurrencyAmount(businessAmount, currency)}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-rose-600">{familyKidsMode ? 'Family & Kids' : 'Personal / Home'}</span>
          <p className="font-bold text-rose-900">
            {formatCurrencyAmount(familyAmount, currency)}
          </p>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-amber-600">{familyKidsMode ? 'Pending Split' : 'Pending Review'}</span>
          <p className="font-bold text-amber-900">
            {formatCurrencyAmount(pendingSplitAmount, currency)}
          </p>
        </div>
      </div>

      {/* Add Expense Form with stacked layout: Description on row 1, Amount/Dropdown/Button on row 2 */}
      <form onSubmit={handleSubmit} className="no-print mb-3.5 bg-stone-50/60 p-3 rounded-xl border border-stone-200">
        <div className="flex flex-col gap-2">
          {/* Row 1: Description Input */}
          <input
            id="expenseDesc"
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Receipt description (e.g. Office supplies, Dental co-pay)..."
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 placeholder:text-stone-400"
          />

          {/* Row 2: Amount, Dropdown, and Log Button */}
          <div className="flex items-center gap-2">
            <input
              id="expenseAmount"
              type="number"
              step="0.01"
              min="0"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="Amount"
              className="w-28 sm:w-32 px-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-stone-800 font-semibold"
            />

            <select
              aria-label="Expense context"
              value={expenseMode}
              onChange={(e) => setExpenseMode(e.target.value as ContextMode)}
              className="flex-1 px-2.5 py-2 text-xs bg-white border border-stone-200 rounded-xl text-stone-700 font-medium"
            >
              {familyKidsMode && <option value="family">Family</option>}
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
              <option value="self">Personal</option>
            </select>

            <button
              id="btn-add-expense"
              type="submit"
              disabled={!desc.trim() || !amountStr}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Log</span>
            </button>
          </div>
        </div>

        {/* Detailed fields toggle */}
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowAddDetails((prev) => !prev)}
            className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-medium transition-colors"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>
              {showAddDetails
                ? 'Hide extra details'
                : familyKidsMode
                ? '+ Add details (Sub-Category, Child Tag, Receipt Photo, Split)'
                : '+ Add details (Sub-Category, Receipt Photo, Tax Claim)'}
            </span>
          </button>

          {receiptImage && (
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Receipt attached
            </span>
          )}
        </div>

        {/* Expandable Add Details Drawer */}
        {showAddDetails && (
          <div className="mt-3 pt-3 border-t border-stone-200 space-y-3">
            <div className={`grid grid-cols-1 ${familyKidsMode ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2.5`}>
              {/* Sub-Category Tag */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Sub-Category
                </label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-700"
                >
                  {EXPENSE_SUB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Child Tag (Only when Family & Kids Mode is enabled) */}
              {familyKidsMode && (
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Child Tag
                  </label>
                  <select
                    value={selectedKidTag}
                    onChange={(e) => setSelectedKidTag(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-700"
                  >
                    <option value="none">None / General</option>
                    {kidTags.map((tag) => (
                      <option key={tag} value={tag}>
                        👦 {tag}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Split / Reimbursement Status */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Reimbursement / Tax Status
                </label>
                <select
                  value={reimburseStatus}
                  onChange={(e) => setReimburseStatus(e.target.value as ReimbursementStatus)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-lg text-stone-700"
                >
                  <option value="none">Standard Personal</option>
                  <option value="pending_split">⏳ Split Pending (Partner/Client)</option>
                  <option value="reimbursed">✅ Reimbursed</option>
                  <option value="claimable">🏷️ Tax Claimable Write-off</option>
                </select>
              </div>
            </div>

            {/* Receipt Photo Attachment */}
            <div className="flex items-center gap-3">
              <input
                ref={receiptInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleReceiptUpload}
              />
              <button
                type="button"
                onClick={() => receiptInputRef.current?.click()}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  receiptImage
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>{receiptImage ? 'Change Receipt Photo' : 'Attach Receipt Photo'}</span>
              </button>

              {receiptImage && (
                <div className="flex items-center gap-2">
                  <img
                    src={receiptImage}
                    alt="Receipt thumbnail"
                    className="w-8 h-8 object-cover rounded border border-emerald-200"
                  />
                  <button
                    type="button"
                    onClick={() => setReceiptImage(null)}
                    className="text-stone-400 hover:text-rose-600 text-xs font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Expense List */}
      <div id="expenseContainer" className="space-y-2">
        {activeExpenses.length === 0 ? (
          <div className="py-6 text-center border border-dashed border-stone-100 rounded-xl">
            <p className="text-xs text-stone-400">No expenses logged yet. Keep your cash flows organized!</p>
          </div>
        ) : (
          activeExpenses.map((item) => {
            const config = MODE_CONFIGS[item.mode || 'business'] || MODE_CONFIGS.business;
            const rConfig = REIMBURSE_CONFIG[item.reimbursementStatus || 'none'];

            return (
              <div
                key={item.id}
                className="group rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-all p-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-semibold text-stone-800">
                        {item.text}
                      </span>

                      {/* Sub-category Pill */}
                      {item.subCategory && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-stone-100 text-stone-700 border border-stone-200 rounded">
                          {item.subCategory}
                        </span>
                      )}

                      {/* Child Tag */}
                      {familyKidsMode && item.kidTag && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full flex items-center gap-1">
                          👦 {item.kidTag}
                        </span>
                      )}

                      {/* Reimbursement status toggle button */}
                      {item.reimbursementStatus && item.reimbursementStatus !== 'none' && (
                        <button
                          type="button"
                          onClick={() => handleCycleReimbursement(item)}
                          title="Click to cycle status"
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-opacity hover:opacity-80 ${rConfig.bg} ${rConfig.text} ${rConfig.border}`}
                        >
                          {rConfig.label}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400 font-medium">
                      <span>{item.date || 'Today'}</span>
                      <span>•</span>
                      <span className="uppercase tracking-wider text-[10px] font-bold text-stone-500">
                        {item.mode}
                      </span>

                      {/* Receipt indicator */}
                      {item.receiptImage && (
                        <>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxReceipt({
                                url: item.receiptImage!,
                                title: `${item.text} (${formatCurrencyAmount(item.amount, currency)})`,
                              })
                            }
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold"
                          >
                            <Camera className="w-3 h-3" />
                            <span>View Receipt</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right side: Amount and delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-stone-900">
                      {formatCurrencyAmount(item.amount, currency)}
                    </span>

                    <button
                      type="button"
                      onClick={() => onDeleteExpense(item.id)}
                      className="no-print p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete expense"
                      aria-label={`Delete expense ${item.text}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Receipt Image Thumbnail in Detailed View */}
                {isDetailedView && item.receiptImage && (
                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center gap-2">
                    <div
                      onClick={() =>
                        setLightboxReceipt({
                          url: item.receiptImage!,
                          title: `${item.text} (${formatCurrencyAmount(item.amount, currency)})`,
                        })
                      }
                      className="group/thumb relative cursor-pointer overflow-hidden rounded-lg border border-stone-200 hover:border-emerald-300 transition-all"
                    >
                      <img
                        src={item.receiptImage}
                        alt="Receipt"
                        className="w-14 h-14 object-cover rounded-lg group-hover/thumb:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      <p className="font-semibold text-stone-700">Receipt Attached</p>
                      <p className="text-[10px] text-stone-400">Click image to inspect write-off details</p>
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