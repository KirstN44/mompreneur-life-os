import React, { useState, useRef, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Pin,
  Trash2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  Image as ImageIcon,
  Plus,
  Tag,
  Copy,
  Check,
  Calendar,
  X,
  Eye,
  FileText,
  Filter,
} from 'lucide-react';
import { NoteItem, ContextMode, FullPageView } from '../../types';
import { MODE_CONFIGS, DEFAULT_KID_TAGS } from '../../constants';
import { ModuleNavHeader } from './ModuleNavHeader';

interface BrainDumpWorkspaceViewProps {
  notes: NoteItem[];
  activeMode: ContextMode;
  kidTags?: string[];
  familyKidsMode?: boolean;
  onAddNote: (
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
  onDeleteNote: (id: number) => void;
  onTogglePin: (id: number) => void;
  onUpdateNote?: (updated: NoteItem) => void;
  onAddKidTag?: (newTag: string) => void;
  onBackToDashboard: () => void;
  onSwitchView: (view: FullPageView) => void;
}

export const BrainDumpWorkspaceView: React.FC<BrainDumpWorkspaceViewProps> = ({
  notes,
  activeMode,
  kidTags = DEFAULT_KID_TAGS,
  familyKidsMode = true,
  onAddNote,
  onDeleteNote,
  onTogglePin,
  onUpdateNote,
  onAddKidTag,
  onBackToDashboard,
  onSwitchView,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKidFilter, setSelectedKidFilter] = useState('all');
  const [selectedModeFilter, setSelectedModeFilter] = useState('all');
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [onlyWithMedia, setOnlyWithMedia] = useState(false);

  // Active Note Selection for Right Panel
  const [activeNoteId, setActiveNoteId] = useState<number | null>(() => {
    return notes.length > 0 ? notes[0].id : null;
  });

  // New Note Scratchpad
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteMode, setNewNoteMode] = useState<ContextMode>(
    !familyKidsMode && activeMode === 'family' ? 'business' : activeMode
  );
  const [newNoteKidTag, setNewNoteKidTag] = useState<string>('General');
  const [newNoteImage, setNewNoteImage] = useState<string | null>(null);

  // Voice recording & TTS
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingId, setIsPlayingId] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [copiedNoteId, setCopiedNoteId] = useState<number | null>(null);

  // Filtered Notes with Solopreneur mode sanitization
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // If Solopreneur mode (familyKidsMode is false), exclude family mode and kid-related notes
      if (!familyKidsMode) {
        if (n.mode === 'family') return false;
        if (n.kidTag && n.kidTag !== 'General' && n.kidTag !== 'none') return false;
        const text = (n.text || '').toLowerCase();
        if (
          text.includes('leo') ||
          text.includes('maya') ||
          text.includes('school') ||
          text.includes('pediatric') ||
          text.includes('daycare') ||
          text.includes('ballet') ||
          text.includes('science fair') ||
          text.includes('teacher') ||
          text.includes('child')
        ) {
          return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesText = n.text.toLowerCase().includes(q);
        const matchesKid = n.kidTag?.toLowerCase().includes(q);
        if (!matchesText && !matchesKid) return false;
      }
      if (onlyPinned && !n.pinned) return false;
      if (onlyWithMedia && !n.imageUrl && !n.hasAudioMemo) return false;
      if (selectedKidFilter !== 'all' && n.kidTag !== selectedKidFilter) return false;
      if (selectedModeFilter !== 'all' && n.mode !== selectedModeFilter) return false;
      return true;
    });
  }, [notes, searchQuery, onlyPinned, onlyWithMedia, selectedKidFilter, selectedModeFilter, familyKidsMode]);

  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || (filteredNotes.length > 0 ? filteredNotes[0] : null);
  }, [notes, activeNoteId, filteredNotes]);

  // Handle Voice Dictation
  const toggleRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setNewNoteText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  // Text to Speech
  const toggleTTS = (note: NoteItem) => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingId === note.id) {
      window.speechSynthesis.cancel();
      setIsPlayingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(note.text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingId(null);
    utterance.onerror = () => setIsPlayingId(null);
    setIsPlayingId(note.id);
    window.speechSynthesis.speak(utterance);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Image size exceeds 4MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) setNewNoteImage(result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveNewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    onAddNote(newNoteText.trim(), newNoteMode, {
      kidTag: newNoteKidTag !== 'General' ? newNoteKidTag : undefined,
      imageUrl: newNoteImage || undefined,
      hasAudioMemo: isRecording,
    });

    setNewNoteText('');
    setNewNoteImage(null);
  };

  const handleCopyNote = (note: NoteItem) => {
    navigator.clipboard.writeText(note.text);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#faf7f5] text-stone-800 pb-16">
      {/* Sticky Top Nav Bar */}
      <ModuleNavHeader
        currentView="braindump"
        activeMode={activeMode}
        onBackToDashboard={onBackToDashboard}
        onSwitchView={onSwitchView}
        title="Brain Dump & Multitasking Notes Workspace"
        badgeText={`${filteredNotes.length} ARCHIVED`}
        onPrint={() => window.print()}
        printLabel="Print Notes Sheet"
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
              alt="Attachment preview"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-4">
        {/* Quick Scratchpad Bar at Top */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs">
          <form onSubmit={handleSaveNewNote} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Instant Brain Dump Capture
              </span>
              <div className="flex items-center gap-2">
                {familyKidsMode && (
                  <select
                    value={newNoteKidTag}
                    onChange={(e) => setNewNoteKidTag(e.target.value)}
                    className="text-xs font-semibold px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
                  >
                    <option value="General">🏷️ General Note</option>
                    {kidTags.map((k) => (
                      <option key={k} value={k}>
                        🧒 {k}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={newNoteMode}
                  onChange={(e) => setNewNoteMode(e.target.value as ContextMode)}
                  className="text-xs font-semibold px-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-stone-700"
                >
                  {familyKidsMode && <option value="family">Family</option>}
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="self">Self Care &amp; Admin</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                rows={2}
                placeholder={
                  familyKidsMode
                    ? 'Dump mental clutter, kid reminders, business ideas, teacher messages, or thoughts...'
                    : 'Dump mental clutter, business ideas, client notes, project thoughts, or voice memos...'
                }
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 placeholder:text-stone-400"
              />
            </div>

            {/* Bottom tools row */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {/* Voice Record Button */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                    isRecording
                      ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecording ? 'Listening...' : 'Voice Dictate'}</span>
                </button>

                {/* Photo Upload Button */}
                <input
                  ref={imageUploadRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => imageUploadRef.current?.click()}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                    newNoteImage
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{newNoteImage ? 'Photo Attached' : 'Attach Flyer/Photo'}</span>
                </button>

                {newNoteImage && (
                  <div className="flex items-center gap-1.5">
                    <img
                      src={newNoteImage}
                      alt="Thumbnail"
                      className="w-7 h-7 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => setNewNoteImage(null)}
                      className="text-stone-400 hover:text-rose-700 text-xs font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 disabled:opacity-50 rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Save Note</span>
              </button>
            </div>
          </form>
        </div>

        {/* Dual-Panel Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Panel: Search, Filters & Note Archive List (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-2xl border border-stone-200 p-3.5 shadow-xs space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search historical notes & transcripts..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Tag / Category Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedKidFilter('all');
                    setSelectedModeFilter('all');
                    setOnlyPinned(false);
                    setOnlyWithMedia(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    selectedKidFilter === 'all' && selectedModeFilter === 'all' && !onlyPinned
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All Notes ({filteredNotes.length})
                </button>

                <button
                  type="button"
                  onClick={() => setOnlyPinned((prev) => !prev)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    onlyPinned
                      ? 'bg-rose-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <Pin className="w-3 h-3" />
                  <span>Pinned</span>
                </button>

                {/* Kid tags dropdown (Only when Family & Kids mode is enabled) */}
                {familyKidsMode && (
                  <select
                    aria-label="Filter kid notes"
                    value={selectedKidFilter}
                    onChange={(e) => setSelectedKidFilter(e.target.value)}
                    className="px-2 py-1 text-xs bg-stone-100 border border-stone-200 rounded-lg text-stone-700 font-semibold"
                  >
                    <option value="all">👶 All Kids</option>
                    {kidTags.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                )}

                {/* Mode filter */}
                <select
                  aria-label="Filter context mode"
                  value={selectedModeFilter}
                  onChange={(e) => setSelectedModeFilter(e.target.value)}
                  className="px-2 py-1 text-xs bg-stone-100 border border-stone-200 rounded-lg text-stone-700 font-semibold"
                >
                  <option value="all">📁 All Contexts</option>
                  {familyKidsMode && <option value="family">Family</option>}
                  <option value="business">Business</option>
                  <option value="marketing">Marketing</option>
                  <option value="self">Self Care</option>
                </select>
              </div>
            </div>

            {/* Note Archive List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredNotes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-stone-200 p-8 text-center text-xs text-stone-400">
                  No matching notes found. Try adjusting your search or filters.
                </div>
              ) : (
                filteredNotes.map((note) => {
                  const isSelected = activeNote?.id === note.id;
                  const config = MODE_CONFIGS[note.mode];

                  return (
                    <div
                      key={note.id}
                      onClick={() => setActiveNoteId(note.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-rose-300 ring-2 ring-rose-100 shadow-sm'
                          : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {note.pinned && (
                            <span className="p-0.5 bg-rose-100 text-rose-800 rounded">
                              <Pin className="w-3 h-3 fill-rose-800" />
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${config.badgeBg}`}
                          >
                            {note.mode}
                          </span>
                          {familyKidsMode && note.kidTag && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded">
                              🧒 {note.kidTag}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-stone-400">{note.createdAt}</span>
                      </div>

                      <p className="text-xs font-medium text-stone-800 line-clamp-3 leading-relaxed">
                        {note.text}
                      </p>

                      {/* Attachments preview snippet */}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
                        <div className="flex items-center gap-2">
                          {note.imageUrl && (
                            <span className="inline-flex items-center gap-1 text-rose-800 font-semibold">
                              <ImageIcon className="w-3 h-3" />
                              <span>Photo</span>
                            </span>
                          )}
                          {note.hasAudioMemo && (
                            <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold">
                              <Mic className="w-3 h-3" />
                              <span>Voice</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePin(note.id);
                            }}
                            className="p-1 hover:text-rose-700 rounded"
                            title={note.pinned ? 'Unpin' : 'Pin to top'}
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteNote(note.id);
                            }}
                            className="p-1 hover:text-rose-700 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Expanded Workspace & Active Note Reader (7 cols on lg) */}
          <div className="lg:col-span-7">
            {activeNote ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
                {/* Note Header & Actions */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border ${
                        MODE_CONFIGS[activeNote.mode].badgeBg
                      }`}
                    >
                      {activeNote.mode}
                    </span>
                    {familyKidsMode && activeNote.kidTag && (
                      <span className="text-xs font-bold px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full flex items-center gap-1">
                        🧒 {activeNote.kidTag}
                      </span>
                    )}
                    <span className="text-xs text-stone-400">{activeNote.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Read Aloud Button */}
                    <button
                      type="button"
                      onClick={() => toggleTTS(activeNote)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                        isPlayingId === activeNote.id
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                      title="Read note aloud"
                    >
                      {isPlayingId === activeNote.id ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      <span>{isPlayingId === activeNote.id ? 'Stop' : 'Listen'}</span>
                    </button>

                    {/* Copy Note */}
                    <button
                      type="button"
                      onClick={() => handleCopyNote(activeNote)}
                      className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Copy text"
                    >
                      {copiedNoteId === activeNote.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Pin Note */}
                    <button
                      type="button"
                      onClick={() => onTogglePin(activeNote.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        activeNote.pinned
                          ? 'text-rose-800 bg-rose-50'
                          : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                      }`}
                      title={activeNote.pinned ? 'Unpin' : 'Pin note'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>

                    {/* Delete Note */}
                    <button
                      type="button"
                      onClick={() => onDeleteNote(activeNote.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Note Text Content */}
                <div className="prose max-w-none text-stone-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                  {activeNote.text}
                </div>

                {/* Attached Photo Gallery */}
                {activeNote.imageUrl && (
                  <div className="pt-4 border-t border-stone-100 space-y-2">
                    <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-rose-800" /> Attached Photo / Flyer
                    </span>
                    <div
                      onClick={() => setLightboxImage(activeNote.imageUrl!)}
                      className="relative group/img cursor-pointer max-w-md rounded-xl overflow-hidden border border-stone-200 hover:border-rose-300 transition-all"
                    >
                      <img
                        src={activeNote.imageUrl}
                        alt="Attached document"
                        className="max-h-72 w-full object-contain bg-stone-50"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity font-semibold text-xs gap-1">
                        <Eye className="w-4 h-4" /> Click to enlarge
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-stone-300" />
                <h3 className="font-bold text-stone-700">No Note Selected</h3>
                <p className="text-xs">
                  Select a note from the archive on the left or create a new brain dump above.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
