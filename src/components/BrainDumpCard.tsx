import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Pin,
  Check,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Search,
  X,
  ArrowLeft,
  Printer,
  Sparkles,
  Tag,
} from 'lucide-react';
import { ContextMode, NoteItem } from '../types';
import { MODE_CONFIGS, DEFAULT_KID_TAGS } from '../constants';

interface BrainDumpCardProps {
  notes?: NoteItem[];
  activeMode?: ContextMode;
  kidTags?: string[];
  familyKidsMode?: boolean;
  onAddNote?: (
    text: string,
    mode: ContextMode,
    extra?: {
      kidTag?: string;
      imageUrl?: string;
      imageName?: string;
      hasAudioMemo?: boolean;
      audioDuration?: string;
    }
  ) => void;
  onDeleteNote?: (id: number) => void;
  onTogglePin?: (id: number) => void;
  onUpdateNote?: (updatedNote: NoteItem) => void;
  onAddKidTag?: (newTag: string) => void;
  onBackToDashboard?: () => void;
}

export const BrainDumpCard: React.FC<BrainDumpCardProps> = ({
  notes = [],
  activeMode = 'family',
  kidTags = DEFAULT_KID_TAGS || [],
  familyKidsMode = true,
  onAddNote,
  onDeleteNote,
  onTogglePin,
  onUpdateNote,
  onAddKidTag,
  onBackToDashboard,
}) => {
  const [noteText, setNoteText] = useState('');
  const [selectedMode, setSelectedMode] = useState<ContextMode>(
    !familyKidsMode && activeMode === 'family' ? 'business' : activeMode
  );
  const [selectedKidTag, setSelectedKidTag] = useState<string>('none');
  const [selectedFilterKid, setSelectedFilterKid] = useState<string>('all');
  const [selectedFilterContext, setSelectedFilterContext] = useState<string>('all');
  const [filterTab, setFilterTab] = useState<'all' | 'pinned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);

  // New Custom Tag State
  const [isAddingKidInForm, setIsAddingKidInForm] = useState(false);
  const [isAddingKidInFilter, setIsAddingKidInFilter] = useState(false);
  const [newKidName, setNewKidName] = useState('');

  // Image & Lightbox
  const [attachedImage, setAttachedImage] = useState<{ url: string; name: string } | null>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<{ url: string; title: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio / Voice recognition
  const [isListening, setIsListening] = useState(false);
  const [speakingNoteId, setSpeakingNoteId] = useState<number | null>(null);
  const [includeAudioMemoTag, setIncludeAudioMemoTag] = useState(false);

  // Copy indicator
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    if (!familyKidsMode && activeMode === 'family') {
      setSelectedMode('business');
    } else {
      setSelectedMode(activeMode);
    }
  }, [activeMode, familyKidsMode]);

  const handleSaveCustomTag = (target: 'form' | 'filter') => {
    const tag = newKidName.trim();
    if (!tag) return;

    if (onAddKidTag) {
      onAddKidTag(tag);
    }

    if (target === 'form') {
      setSelectedKidTag(tag);
      setIsAddingKidInForm(false);
    } else {
      setSelectedFilterKid(tag);
      setIsAddingKidInFilter(false);
    }
    setNewKidName('');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Photo is too large. Please select an image under 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setAttachedImage({ url: result, name: file.name });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSpeakNote = (note: NoteItem) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingNoteId === note.id) {
      window.speechSynthesis.cancel();
      setSpeakingNoteId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(note.text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onend = () => setSpeakingNoteId(null);
    utterance.onerror = () => setSpeakingNoteId(null);

    setSpeakingNoteId(note.id);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNoteText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIncludeAudioMemoTag(true);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() && !attachedImage) return;

    if (onAddNote) {
      onAddNote(noteText.trim() || 'Photo Note', selectedMode, {
        kidTag: selectedKidTag !== 'none' ? selectedKidTag : undefined,
        imageUrl: attachedImage?.url,
        imageName: attachedImage?.name,
        hasAudioMemo: includeAudioMemoTag,
        audioDuration: includeAudioMemoTag ? '0:35' : undefined,
      });
    }

    setNoteText('');
    setAttachedImage(null);
    setIncludeAudioMemoTag(false);
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Safe Array checks to prevent rendering crashes
  const safeNotes = Array.isArray(notes) ? notes : [];
  const safeKidTags = Array.isArray(kidTags) ? kidTags : [];

  const filteredNotes = safeNotes
    .filter((n) => {
      const text = (n.text || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      if (q && !text.includes(q)) return false;
      if (filterTab === 'pinned' && !n.pinned) return false;
      if (selectedFilterContext !== 'all' && n.mode !== selectedFilterContext) return false;

      if (selectedFilterKid === 'none') {
        if (n.kidTag && n.kidTag !== 'none') return false;
      } else if (selectedFilterKid !== 'all') {
        if (n.kidTag !== selectedFilterKid) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.id - a.id;
    });

  const activeNote = safeNotes.find((n) => n.id === activeNoteId) || filteredNotes[0] || null;

  return (
    <div className="min-h-screen bg-stone-100 p-4 sm:p-6 text-stone-800">
      {/* Lightbox Modal */}
      {lightboxImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setLightboxImageUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-2 border-b border-stone-100">
              <span className="text-xs font-semibold text-stone-700 truncate">
                {lightboxImageUrl.title || 'Photo Attachment'}
              </span>
              <button
                type="button"
                onClick={() => setLightboxImageUrl(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={lightboxImageUrl.url}
              alt="Enlarged preview"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
          )}
          <span className="text-xs text-stone-400">Dashboard &gt; Brain Dump &amp; Multitasking Notes Workspace</span>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
        >
          <Printer className="w-3.5 h-3.5 text-stone-500" />
          <span>Print Notes Sheet</span>
        </button>
      </div>

      {/* Instant Brain Dump Capture Box */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-rose-800" />
            <span>INSTANT BRAIN DUMP CAPTURE</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tag Selection / Add Dropdown */}
            {familyKidsMode && (
              <div className="relative">
                <select
                  aria-label="Assign custom tag"
                  value={selectedKidTag}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setIsAddingKidInForm(true);
                    } else {
                      setSelectedKidTag(e.target.value);
                      setIsAddingKidInForm(false);
                    }
                  }}
                  className="px-3 py-1 text-xs bg-white border border-stone-200 rounded-xl text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="none">General Note (No Tag)</option>
                  {safeKidTags.map((tag) => (
                    <option key={tag} value={tag}>
                      Tag: {tag}
                    </option>
                  ))}
                  <option value="__add_new__" className="font-bold text-indigo-600">
                    + Add custom name/tag...
                  </option>
                </select>
              </div>
            )}

            {/* Context Mode Selector */}
            <select
              aria-label="Note Context"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value as ContextMode)}
              className="px-3 py-1 text-xs bg-white border border-stone-200 rounded-xl text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {familyKidsMode && <option value="family">Family &amp; School</option>}
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
              <option value="self">Self Care &amp; Admin</option>
            </select>
          </div>
        </div>

        {/* Inline Tag Creator Input in Form */}
        {isAddingKidInForm && (
          <div className="flex items-center gap-2 p-2 bg-indigo-50 border border-indigo-200 rounded-xl mb-3">
            <Tag className="w-3.5 h-3.5 text-indigo-600 ml-1" />
            <input
              type="text"
              autoFocus
              value={newKidName}
              onChange={(e) => setNewKidName(e.target.value)}
              placeholder="Enter custom tag name (e.g. Leo, Maya, Work)..."
              className="flex-1 px-2.5 py-1 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveCustomTag('form');
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleSaveCustomTag('form')}
              className="px-3 py-1 text-xs font-bold bg-indigo-700 text-white rounded-lg hover:bg-indigo-800"
            >
              Save Tag
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingKidInForm(false);
                setSelectedKidTag('none');
              }}
              className="p-1 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <textarea
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Dump mental clutter, kid reminders, business ideas, teacher messages, or thoughts..."
          className="w-full text-xs sm:text-sm p-3 bg-white border border-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-stone-400 resize-none"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-stone-500" />}
              <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
              <span>{attachedImage ? 'Photo Attached' : 'Attach Flyer/Photo'}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!noteText.trim() && !attachedImage}
            className="inline-flex items-center gap-1.5 px-5 py-1.5 text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Save Note</span>
          </button>
        </div>
      </form>

      {/* Dual Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-3 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search historical notes..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Filter Tabs & Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  filterTab === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All Notes ({safeNotes.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('pinned')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 ${
                  filterTab === 'pinned'
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Pin className="w-3 h-3" /> Pinned
              </button>

              {/* Kids Filter Dropdown */}
              {familyKidsMode && (
                <div className="relative">
                  <select
                    aria-label="Filter by Kid Tag"
                    value={selectedFilterKid}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsAddingKidInFilter(true);
                      } else {
                        setSelectedFilterKid(e.target.value);
                        setIsAddingKidInFilter(false);
                      }
                    }}
                    className="px-2.5 py-1 text-xs bg-stone-100 border border-stone-200 rounded-xl text-stone-700 font-medium focus:outline-none"
                  >
                    <option value="all">All Kids / Tags</option>
                    <option value="none">Unassigned Notes</option>
                    {safeKidTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                    <option value="__add_new__" className="font-bold text-indigo-600">
                      + Add custom tag...
                    </option>
                  </select>
                </div>
              )}

              {/* Context Filter Dropdown */}
              <select
                aria-label="Filter by Context"
                value={selectedFilterContext}
                onChange={(e) => setSelectedFilterContext(e.target.value)}
                className="px-2.5 py-1 text-xs bg-stone-100 border border-stone-200 rounded-xl text-stone-700 font-medium focus:outline-none"
              >
                <option value="all">All Contexts</option>
                {familyKidsMode && <option value="family">Family</option>}
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="self">Self Care</option>
              </select>
            </div>

            {/* Filter Inline Tag Creator Form */}
            {isAddingKidInFilter && (
              <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 p-1.5 rounded-xl mt-2">
                <input
                  type="text"
                  autoFocus
                  value={newKidName}
                  onChange={(e) => setNewKidName(e.target.value)}
                  placeholder="New Tag Name..."
                  className="flex-1 px-2 py-1 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveCustomTag('filter');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleSaveCustomTag('filter')}
                  className="px-2.5 py-1 text-xs font-bold bg-indigo-700 text-white rounded-lg hover:bg-indigo-800"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingKidInFilter(false);
                    setSelectedFilterKid('all');
                  }}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Notes Card List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-stone-200">
                <p className="text-xs text-stone-400">No notes found matching your filters.</p>
              </div>
            ) : (
              filteredNotes.map((n) => {
                const config = (MODE_CONFIGS && MODE_CONFIGS[n.mode]) || { badgeBg: 'bg-stone-100 text-stone-700' };
                const isSelected = activeNote?.id === n.id;

                return (
                  <div
                    key={n.id}
                    onClick={() => setActiveNoteId(n.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-indigo-400 ring-1 ring-indigo-400/20'
                        : 'bg-white hover:border-stone-300 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${config.badgeBg}`}>
                          {n.mode}
                        </span>
                        {n.kidTag && n.kidTag !== 'none' && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {n.kidTag}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400">{n.createdAt || 'Today'}</span>
                    </div>

                    <p className="text-xs text-stone-700 line-clamp-2 leading-relaxed">{n.text}</p>

                    <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-stone-50">
                      {onTogglePin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(n.id);
                          }}
                          className="p-1 text-stone-400 hover:text-amber-600 rounded"
                        >
                          <Pin className={`w-3.5 h-3.5 ${n.pinned ? 'fill-current text-amber-600' : ''}`} />
                        </button>
                      )}
                      {onDeleteNote && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNote(n.id);
                          }}
                          className="p-1 text-stone-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Note Inspector */}
        <div className="lg:col-span-7">
          {activeNote ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${(MODE_CONFIGS && MODE_CONFIGS[activeNote.mode])?.badgeBg || 'bg-stone-100'}`}>
                    {activeNote.mode}
                  </span>
                  {activeNote.kidTag && activeNote.kidTag !== 'none' && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                      👦 {activeNote.kidTag}
                    </span>
                  )}
                  <span className="text-xs text-stone-400">{activeNote.createdAt || 'Today'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSpeakNote(activeNote)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
                  >
                    {speakingNoteId === activeNote.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>Listen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeNote.id, activeNote.text)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg border border-stone-200"
                  >
                    {copiedId === activeNote.id ? <Check className="w-4 h-4 text-emerald-600" /> : <span className="text-xs font-semibold">Copy</span>}
                  </button>
                  {onTogglePin && (
                    <button
                      type="button"
                      onClick={() => onTogglePin(activeNote.id)}
                      className="p-1.5 text-stone-400 hover:text-amber-600 rounded-lg border border-stone-200"
                    >
                      <Pin className={`w-4 h-4 ${activeNote.pinned ? 'fill-current text-amber-600' : ''}`} />
                    </button>
                  )}
                  {onDeleteNote && (
                    <button
                      type="button"
                      onClick={() => onDeleteNote(activeNote.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg border border-stone-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="py-2">
                <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">{activeNote.text}</p>
              </div>

              {activeNote.imageUrl && (
                <div className="pt-3 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-500 mb-2">Attached Image / Flyer</h4>
                  <div
                    onClick={() => setLightboxImageUrl({ url: activeNote.imageUrl!, title: activeNote.text })}
                    className="cursor-pointer inline-block overflow-hidden rounded-xl border border-stone-200 hover:border-indigo-300 transition-all"
                  >
                    <img src={activeNote.imageUrl} alt="Attached note content" className="max-h-72 object-contain" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Select a note from the left panel to inspect or edit details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};